import { useEffect, useState } from "react";
import { BackButton } from "../components/BackButton.tsx";
import axios from "axios";
import { Printer, X, Clock, CheckCircle2, XCircle } from "lucide-react";

interface OrderItem {
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    tableNumber: number;
    status: string;
    totalAmount: number;
    items: OrderItem[];
    createdAt?: string;
}

export function OrderTicket() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const response = await axios.get("https://espetinho-da-paula-backend.vercel.app/orders");

                const formattedOrders: Order[] = (response.data || []).map((order: any) => ({
                    id: order.id ?? order.ID,
                    tableNumber: order.tableNumber ?? order.TABLE_ID ?? order.table_id,
                    status: (order.status ?? order.STATUS ?? "ACTIVE").toUpperCase(),
                    totalAmount: Number(order.totalAmount ?? order.TOTAL_AMOUNT ?? 0),
                    items: (order.items ?? order.ITEMS ?? []).map((item: any) => ({
                        productName: item.productName ?? item.product?.name ?? item.product?.NAME ?? "Item",
                        quantity: Number(item.quantity ?? item.QUANTITY ?? 0),
                        price: Number(item.price ?? item.PRICE ?? 0),
                    })),
                    createdAt: order.createdAt ?? order.CREATED_AT,
                }));

                setOrders(formattedOrders);
            } catch (error) {
                console.error("Erro ao buscar comandas:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const handleCloseOrder = async (orderId: number, tableNumber: number) => {
        const confirmClose = window.confirm(
            `Deseja realmente fechar a comanda da Mesa ${tableNumber} e liberá-la?`
        );

        if (!confirmClose) return;

        try {
            const response = await axios.patch(
                `https://espetinho-da-paula-backend.vercel.app/orders/${orderId}/close`
            );

            if (response.status !== 200 && response.status !== 204) {
                throw new Error("Erro ao encerrar comanda.");
            }

            alert(`Comanda da Mesa ${tableNumber} encerrada com sucesso!`);

            setOrders((prevOrders) =>
                prevOrders.map((ord) =>
                    ord.id === orderId ? { ...ord, status: "CLOSED" } : ord
                )
            );
            setSelectedOrder(null);
        } catch (error: any) {
            console.error("Erro ao fechar comanda:", error);
            alert(error.response?.data?.message || "Não foi possível fechar a comanda.");
        }
    };

    const activeOrders = orders.filter((o) => o.status === "ACTIVE" || o.status === "OPEN" || !o.status);
    const closedOrders = orders.filter((o) => o.status === "CLOSED" || o.status === "FINISHED");
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

    const handlePrint = () => {
        window.print();
    };

    const getGroupedItems = (items: OrderItem[] = []) => {
        const grouped = items.reduce((acc: { [key: string]: OrderItem }, item) => {
            const key = item.productName;
            if (!acc[key]) {
                acc[key] = { ...item };
            } else {
                acc[key].quantity += item.quantity;
            }
            return acc;
        }, {});

        return Object.values(grouped);
    };

    const renderOrderSection = (title: string, list: Order[], badgeColor: string, icon: React.ReactNode) => {
        if (list.length === 0) return null;

        return (
            <div className="w-full max-w-xl mb-8">
                <div className="flex items-center gap-2 mb-4">
                    {icon}
                    <h3 className="text-lg font-bold text-[#3B2219]">{title} ({list.length})</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {list.map((order) => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="bg-white/80 border border-[#E6D5BC] p-4 rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-extrabold text-lg text-[#3B2219]">
                                    Mesa {order.tableNumber || order.id}
                                </span>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${badgeColor}`}>
                                    {title}
                                </span>
                            </div>
                            <div className="flex justify-between items-end mt-2 pt-2 border-t border-zinc-100">
                                <span className="text-xs text-zinc-500">Toque para ver comanda</span>
                                <span className="font-extrabold text-[#92400E]">
                                    R$ {Number(order.totalAmount || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-24 px-4 pb-12">
            <BackButton to={"/"} />

            <h2 className="text-2xl font-bold text-[#3B2219] mb-8 text-center">
                Histórico de Comandas
            </h2>

            {loading ? (
                <p className="text-zinc-600">Carregando comandas...</p>
            ) : orders.length === 0 ? (
                <p className="text-zinc-500">Nenhuma comanda registrada no momento.</p>
            ) : (
                <div className="w-full flex flex-col items-center">
                    {renderOrderSection("Ativas", activeOrders, "bg-amber-100 text-amber-800 border border-amber-300", <Clock size={20} className="text-amber-700" />)}
                    {renderOrderSection("Encerradas", closedOrders, "bg-emerald-100 text-emerald-800 border border-emerald-300", <CheckCircle2 size={20} className="text-emerald-700" />)}
                    {renderOrderSection("Canceladas", cancelledOrders, "bg-rose-100 text-rose-800 border border-rose-300", <XCircle size={20} className="text-rose-700" />)}
                </div>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#E6D5BC] flex flex-col relative max-h-[90vh]">

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center pb-4 border-b border-dashed border-zinc-200 mb-4">
                            <h3 className="text-xl font-bold text-[#3B2219]">Espetinho da Paula</h3>
                            <p className="text-xs text-zinc-500">Comanda - Mesa {selectedOrder.tableNumber || selectedOrder.id}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Itens Consumidos</div>

                            {getGroupedItems(selectedOrder.items).map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="text-zinc-700">
                                        <span className="font-bold text-zinc-900 mr-2">{item.quantity}x</span>
                                        {item.productName}
                                    </div>
                                    <span className="font-medium text-zinc-800">
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-dashed border-zinc-200 mt-2 mb-6">
                            <div className="flex justify-between items-center font-extrabold text-lg text-[#3B2219]">
                                <span>Valor Final:</span>
                                <span>R$ {Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 py-3 bg-[#FEF3C7] border border-[#FBBF24] text-[#92400E] font-bold rounded-xl hover:bg-[#FDE68A] transition flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Printer size={18} />
                                    <span>Imprimir</span>
                                </button>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition"
                                >
                                    Fechar
                                </button>
                            </div>

                            {(selectedOrder.status === "ACTIVE" || selectedOrder.status === "OPEN") && (
                                <button
                                    onClick={() => handleCloseOrder(selectedOrder.id, selectedOrder.tableNumber || selectedOrder.id)}
                                    className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition shadow-sm flex items-center justify-center gap-2 mt-1"
                                >
                                    <CheckCircle2 size={18} />
                                    <span>Encerrar Comanda e Liberar Mesa</span>
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
