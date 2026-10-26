import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart3 } from "lucide-react";

export function AnalyticsCharts() {
    const [loading, setLoading] = useState(true);
    const [dailyData, setDailyData] = useState<{ day: string; total: number }[]>([]);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const res = await axios.get("https://espetinho-da-paula-backend.vercel.app/orders").catch(() => ({ data: [] }));
                const orders = res.data || [];

                const daysMap = new Map<string, number>();

                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
                    daysMap.set(key, 0);
                }

                orders.forEach((order: any) => {
                    const orderDate = new Date(order.createdAt);
                    const key = orderDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

                    if (daysMap.has(key)) {
                        const orderTotal = order.totalAmount || order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                        daysMap.set(key, (daysMap.get(key) || 0) + orderTotal);
                    }
                });

                const formatted = Array.from(daysMap.entries()).map(([day, total]) => ({ day, total }));
                setDailyData(formatted);
            } catch (error) {
                console.error("Erro ao carregar dados do gráfico:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-zinc-400">Carregando gráficos analíticos...</div>;
    }

    const maxTotal = Math.max(...dailyData.map((d) => d.total), 10);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <BarChart3 className="text-amber-500" /> Gráficos de Desempenho - Espetinho da Paula
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-100">Faturamento dos Últimos 7 Dias</h2>
                    <p className="text-sm text-zinc-400">Acompanhamento diário da receita gerada no estabelecimento.</p>
                </div>

                <div className="h-64 flex items-end gap-4 pt-6 border-b border-zinc-800 pb-2">
                    {dailyData.map((item, idx) => {
                        const heightPercent = Math.round((item.total / maxTotal) * 100);
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-xs text-amber-400 font-semibold mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  R$ {item.total.toFixed(0)}
                </span>
                                <div
                                    style={{ height: `${Math.max(heightPercent, 6)}%` }}
                                    className="w-full bg-amber-500/80 hover:bg-amber-400 rounded-t-md transition-all duration-300"
                                ></div>
                                <span className="text-xs text-zinc-400 mt-3 truncate">{item.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
