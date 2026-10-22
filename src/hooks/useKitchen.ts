import { useState, useEffect } from "react";
import axios from "axios";
import { type KitchenItem } from "../types/Kitchen";

const STORAGE_KEY = "espetinho_kitchen_delivered_items";

export function useKitchen() {
    const [items, setItems] = useState<KitchenItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<KitchenItem | null>(null);

    // Carrega o histórico do localStorage
    const getDeliveredKeys = (): Set<string> => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    };

    // Salva ou remove do localStorage
    const saveDeliveredKey = (orderId: number, productName: string, isDelivered: boolean) => {
        try {
            const deliveredKeys = getDeliveredKeys();
            const key = `${orderId}-${productName.trim().toLowerCase()}`;

            if (isDelivered) {
                deliveredKeys.add(key);
            } else {
                deliveredKeys.delete(key);
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(deliveredKeys)));
        } catch (error) {
            console.error("Erro ao salvar no localStorage:", error);
        }
    };

    const fetchKitchenOrders = async () => {
        try {
            const [ordersRes, productsRes] = await Promise.all([
                axios.get("https://espetinho-da-paula-backend.vercel.app/orders"),
                axios.get("https://espetinho-da-paula-backend.vercel.app/product").catch(() => ({ data: [] })),
            ]);

            const productsList = productsRes.data || [];

            // Mapeia os produtos da Categoria 3
            const acompanhamentoNames = new Set<string>(
                productsList
                    .filter((p: any) => Number(p.category ?? p.categoryId) === 3)
                    .map((p: any) => String(p.name).trim().toLowerCase())
            );

            const deliveredKeys = getDeliveredKeys();
            const extractedItems: KitchenItem[] = [];
            const activeOrderIds = new Set<number>();

            (ordersRes.data || []).forEach((order: any) => {
                const status = (order.status ?? order.STATUS ?? "ACTIVE").toUpperCase();

                // PONTO DE ATENÇÃO 2: Apenas comandas ABERTAS/ATIVAS aparecem na cozinha
                if (status === "ACTIVE" || status === "OPEN") {
                    const orderId = order.id ?? order.ID;
                    activeOrderIds.add(orderId);

                    const orderItems = order.items ?? order.ITEMS ?? [];

                    orderItems.forEach((item: any) => {
                        const rawName = item.productName || item.name || "Item";
                        const normalizedName = String(rawName).trim().toLowerCase();

                        if (acompanhamentoNames.has(normalizedName)) {
                            const itemKey = `${orderId}-${normalizedName}`;

                            const isDelivered = Boolean(item.delivered) || deliveredKeys.has(itemKey);

                            extractedItems.push({
                                orderId: orderId,
                                tableNumber: order.tableNumber ?? order.TABLE_ID ?? order.table_id ?? orderId,
                                productId: item.productId ?? item.id ?? 0,
                                productName: rawName,
                                quantity: Number(item.quantity ?? item.QUANTITY ?? 1),
                                status: isDelivered ? "DELIVERED" : "PENDING",
                            });
                        }
                    });
                }
            });

            // Limpeza de itens antigos do localStorage (se a comanda já foi FECHADA ou CANCELADA)
            const updatedDeliveredKeys = new Set<string>();
            deliveredKeys.forEach((key) => {
                const orderId = Number(key.split("-")[0]);
                if (activeOrderIds.has(orderId)) {
                    updatedDeliveredKeys.add(key);
                }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(updatedDeliveredKeys)));

            setItems(extractedItems);
        } catch (error) {
            console.error("Erro ao carregar pedidos da cozinha:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Busca imediata ao carregar a tela
        fetchKitchenOrders();

        // PONTO DE ATENÇÃO 1: Atualiza automaticamente a cada 5 segundos (Polling)
        const intervalId = setInterval(() => {
            fetchKitchenOrders();
        }, 5000);

        return () => clearInterval(intervalId); // Limpa o timer ao desmontar o componente
    }, []);

    const handleToggleStatus = async (itemToUpdate: KitchenItem, newStatus: "PENDING" | "DELIVERED") => {
        const isDelivered = newStatus === "DELIVERED";

        saveDeliveredKey(itemToUpdate.orderId, itemToUpdate.productName, isDelivered);

        setItems((prevItems) =>
            prevItems.map((item) =>
                item.orderId === itemToUpdate.orderId && item.productName === itemToUpdate.productName
                    ? { ...item, status: newStatus }
                    : item
            )
        );
        setSelectedItem(null);

        try {
            await axios.patch(`https://espetinho-da-paula-backend.vercel.app/orders/${itemToUpdate.orderId}/items`, {
                productName: itemToUpdate.productName,
                delivered: isDelivered,
            });
        } catch (error) {
            console.warn("Status mantido localmente.");
        }
    };

    const pendingItems = items.filter((item) => item.status === "PENDING");
    const deliveredItems = items.filter((item) => item.status === "DELIVERED");

    return {
        items,
        pendingItems,
        deliveredItems,
        loading,
        selectedItem,
        setSelectedItem,
        handleToggleStatus,
    };
}
