import { useState, useEffect } from "react";
import axios from "axios";
import { type KitchenItem } from "../types/Kitchen";

const STORAGE_KEY = "espetinho_kitchen_delivered_items";

export function useKitchen() {
    const [items, setItems] = useState<KitchenItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<KitchenItem | null>(null);

    const getDeliveredKeys = (): Set<string> => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    };

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
                axios.get(`${import.meta.env.VITE}/orders`),
                axios.get(`${import.meta.env.VITE}/product`).catch(() => ({ data: [] })),
            ]);

            const productsList = productsRes.data || [];

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
        fetchKitchenOrders();

        const intervalId = setInterval(() => {
            fetchKitchenOrders();
        }, 5000);

        return () => clearInterval(intervalId);
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
            await axios.patch(`${import.meta.env.VITE}/orders/${itemToUpdate.orderId}/items`, {
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
