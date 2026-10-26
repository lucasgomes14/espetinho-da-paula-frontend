import { useState, useEffect } from "react";
import axios from "axios";
import { DollarSign, TrendingUp, Calendar, Award, Utensils, Coffee, Beer, X, BarChart2 } from "lucide-react";
import { BackButton } from "../components/BackButton.tsx";
import type { ProductRanking } from "../types/ProductRanking.ts";
import type { Order } from "../types/Order.ts";

export function Metrics() {
    const [loading, setLoading] = useState(true);
    const [weeklyRevenue, setWeeklyRevenue] = useState(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [annualRevenue, setAnnualRevenue] = useState(0);

    const [espetosRanking, setEspetosRanking] = useState<ProductRanking[]>([]);
    const [acompanhamentosRanking, setAcompanhamentosRanking] = useState<ProductRanking[]>([]);
    const [bebidasRanking, setBebidasRanking] = useState<ProductRanking[]>([]);

    const [dailyBreakdown, setDailyBreakdown] = useState<{ label: string; value: number }[]>([]);
    const [weeklyBreakdown, setWeeklyBreakdown] = useState<{ label: string; value: number }[]>([]);
    const [monthlyBreakdown, setMonthlyBreakdown] = useState<{ label: string; value: number }[]>([]);

    const [activeModal, setActiveModal] = useState<"weekly" | "monthly" | "annual" | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE}/orders`).catch(() => ({ data: [] })),
                    axios.get(`${import.meta.env.VITE}/product`).catch(() => ({ data: [] })),
                ]);

                const orders: Order[] = ordersRes.data || [];
                const products = productsRes.data || [];

                const productCategoryMap = new Map<string, "espeto" | "acompanhamento" | "bebida">();
                products.forEach((p: any) => {
                    const cat = Number(p.category ?? p.categoryId);
                    const name = String(p.name).trim().toLowerCase();
                    if (cat === 1) productCategoryMap.set(name, "espeto");
                    else if (cat === 3) productCategoryMap.set(name, "acompanhamento");
                    else productCategoryMap.set(name, "bebida");
                });

                let weekTotal = 0;
                let monthTotal = 0;
                let yearTotal = 0;

                const now = new Date();
                const statsMap = new Map<string, { quantity: number; revenue: number; category: "espeto" | "acompanhamento" | "bebida" }>();

                const dailyMap = new Map<string, number>();
                const weeklyMap = new Map<string, number>();
                const monthlyMap = new Map<string, number>();

                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
                    dailyMap.set(label, 0);
                }

                const monthsNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                monthsNames.forEach((m) => monthlyMap.set(m, 0));

                orders.forEach((order: any) => {
                    const status = String(order.status || order.STATUS || "").toUpperCase();
                    if (status !== "CLOSED" && status !== "FINISHED") {
                        return;
                    }

                    const rawDate = order.createdAt ?? order.CREATED_AT;
                    const orderDate = rawDate ? new Date(rawDate) : new Date();

                    const orderItems = order.items ?? order.ITEMS ?? [];
                    const orderTotal = Number(order.totalAmount ?? order.TOTAL_AMOUNT ?? 0) || orderItems.reduce((acc: number, item: any) => acc + (Number(item.price ?? item.PRICE ?? 0) * Number(item.quantity ?? item.QUANTITY ?? 0)), 0);

                    if (orderDate.getFullYear() === now.getFullYear()) {
                        yearTotal += orderTotal;
                        const monthName = monthsNames[orderDate.getMonth()];
                        monthlyMap.set(monthName, (monthlyMap.get(monthName) || 0) + orderTotal);

                        if (orderDate.getMonth() === now.getMonth()) {
                            monthTotal += orderTotal;

                            const weekNumber = Math.ceil(orderDate.getDate() / 7);
                            const weekLabel = `Semana ${weekNumber} (${monthName})`;
                            weeklyMap.set(weekLabel, (weeklyMap.get(weekLabel) || 0) + orderTotal);

                            const diffTime = Math.abs(now.getTime() - orderDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays <= 7) {
                                weekTotal += orderTotal;
                                const dayKey = orderDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
                                if (dailyMap.has(dayKey)) {
                                    dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + orderTotal);
                                }
                            }
                        }
                    }

                    orderItems.forEach((item: any) => {
                        const rawName = item.productName || item.name || "Item";
                        const normName = String(rawName).trim().toLowerCase();
                        const category = productCategoryMap.get(normName) || "espeto";
                        const itemQty = Number(item.quantity ?? item.QUANTITY ?? 1);
                        const itemPrice = Number(item.price ?? item.PRICE ?? 0);

                        const current = statsMap.get(rawName) || { quantity: 0, revenue: 0, category };
                        statsMap.set(rawName, {
                            quantity: current.quantity + itemQty,
                            revenue: current.revenue + (itemPrice * itemQty),
                            category,
                        });
                    });
                });

                setWeeklyRevenue(weekTotal);
                setMonthlyRevenue(monthTotal);
                setAnnualRevenue(yearTotal);

                setDailyBreakdown(Array.from(dailyMap.entries()).map(([label, value]) => ({ label, value })));
                setWeeklyBreakdown(Array.from(weeklyMap.entries()).map(([label, value]) => ({ label, value })));
                setMonthlyBreakdown(Array.from(monthlyMap.entries()).map(([label, value]) => ({ label, value })));

                const espetos: ProductRanking[] = [];
                const acompanhamentos: ProductRanking[] = [];
                const bebidas: ProductRanking[] = [];

                statsMap.forEach((val, name) => {
                    const itemData = { name, ...val };
                    if (val.category === "espeto") espetos.push(itemData);
                    else if (val.category === "acompanhamento") acompanhamentos.push(itemData);
                    else bebidas.push(itemData);
                });

                setEspetosRanking(espetos.sort((a, b) => b.quantity - a.quantity));
                setAcompanhamentosRanking(acompanhamentos.sort((a, b) => b.quantity - a.quantity));
                setBebidasRanking(bebidas.sort((a, b) => b.quantity - a.quantity));

            } catch (error) {
                console.error("Erro ao carregar métricas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const handleCardContextMenu = (e: React.MouseEvent, type: "weekly" | "monthly" | "annual") => {
        e.preventDefault();
        setActiveModal(type);
    };

    if (loading) {
        return (
            <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex items-center justify-center text-zinc-600 font-['Inter']">
                Carregando métricas do negócio...
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-24 px-4 pb-12 select-none">
            <BackButton to={"/"} />

            <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-[#3B2219] flex items-center gap-2">
                    <TrendingUp className="text-[#92400E]" /> Dashboard de Métricas
                </h2>
                <span className="text-xs text-[#92400E] bg-[#FEF3C7] border border-[#FBBF24] px-3 py-1.5 rounded-xl shadow-xs">
                    💡 Clique com o **botão direito** nos cards para ver detalhes
                </span>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div
                    onContextMenu={(e) => handleCardContextMenu(e, "weekly")}
                    title="Clique com o botão direito para ver detalhes diários"
                    className="bg-white/80 border border-[#E6D5BC] hover:border-[#FBBF24] transition-all rounded-2xl p-6 shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer group"
                >
                    <div>
                        <p className="text-sm font-medium text-zinc-500 group-hover:text-[#3B2219] transition-colors">Faturamento Semanal</p>
                        <p className="text-3xl font-extrabold text-[#92400E] mt-2">R$ {weeklyRevenue.toFixed(2)}</p>
                        <span className="text-[11px] text-zinc-400 mt-1 block">Clique direito p/ ver por dias</span>
                    </div>
                    <div className="p-3 bg-[#FEF3C7] text-[#92400E] rounded-xl border border-[#FBBF24]">
                        <DollarSign size={28} />
                    </div>
                </div>

                <div
                    onContextMenu={(e) => handleCardContextMenu(e, "monthly")}
                    title="Clique com o botão direito para ver detalhes semanais"
                    className="bg-white/80 border border-[#E6D5BC] hover:border-[#FBBF24] transition-all rounded-2xl p-6 shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer group"
                >
                    <div>
                        <p className="text-sm font-medium text-zinc-500 group-hover:text-[#3B2219] transition-colors">Faturamento Mensal</p>
                        <p className="text-3xl font-extrabold text-[#92400E] mt-2">R$ {monthlyRevenue.toFixed(2)}</p>
                        <span className="text-[11px] text-zinc-400 mt-1 block">Clique direito p/ ver por semanas</span>
                    </div>
                    <div className="p-3 bg-[#FEF3C7] text-[#92400E] rounded-xl border border-[#FBBF24]">
                        <Calendar size={28} />
                    </div>
                </div>

                <div
                    onContextMenu={(e) => handleCardContextMenu(e, "annual")}
                    title="Clique com o botão direito para ver detalhes mensais"
                    className="bg-white/80 border border-[#E6D5BC] hover:border-[#FBBF24] transition-all rounded-2xl p-6 shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer group"
                >
                    <div>
                        <p className="text-sm font-medium text-zinc-500 group-hover:text-[#3B2219] transition-colors">Faturamento Anual</p>
                        <p className="text-3xl font-extrabold text-[#92400E] mt-2">R$ {annualRevenue.toFixed(2)}</p>
                        <span className="text-[11px] text-zinc-400 mt-1 block">Clique direito p/ ver por meses</span>
                    </div>
                    <div className="p-3 bg-[#FEF3C7] text-[#92400E] rounded-xl border border-[#FBBF24]">
                        <Award size={28} />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/80 border border-[#E6D5BC] rounded-2xl p-6 space-y-4 shadow-xs">
                    <h3 className="text-lg font-bold text-[#3B2219] flex items-center gap-2">
                        <Utensils className="text-[#92400E]" size={20} /> Ranking de Espetos
                    </h3>
                    <div className="divide-y divide-zinc-100">
                        {espetosRanking.length === 0 ? (
                            <p className="text-zinc-500 text-sm py-4 text-center">Nenhum dado registrado.</p>
                        ) : (
                            espetosRanking.map((item, idx) => (
                                <div key={idx} className="py-3.5 flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-bold text-[#3B2219]">{idx + 1}. {item.name}</span>
                                        <p className="text-xs text-zinc-500">{item.quantity} unidades vendidas</p>
                                    </div>
                                    <span className="font-extrabold text-[#92400E]">R$ {item.revenue.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white/80 border border-[#E6D5BC] rounded-2xl p-6 space-y-4 shadow-xs">
                    <h3 className="text-lg font-bold text-[#3B2219] flex items-center gap-2">
                        <Coffee className="text-[#92400E]" size={20} /> Acompanhamentos
                    </h3>
                    <div className="divide-y divide-zinc-100">
                        {acompanhamentosRanking.length === 0 ? (
                            <p className="text-zinc-500 text-sm py-4 text-center">Nenhum dado registrado.</p>
                        ) : (
                            acompanhamentosRanking.map((item, idx) => (
                                <div key={idx} className="py-3.5 flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-bold text-[#3B2219]">{idx + 1}. {item.name}</span>
                                        <p className="text-xs text-zinc-500">{item.quantity} unidades vendidas</p>
                                    </div>
                                    <span className="font-extrabold text-[#92400E]">R$ {item.revenue.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white/80 border border-[#E6D5BC] rounded-2xl p-6 space-y-4 shadow-xs">
                    <h3 className="text-lg font-bold text-[#3B2219] flex items-center gap-2">
                        <Beer className="text-[#92400E]" size={20} /> Ranking de Bebidas
                    </h3>
                    <div className="divide-y divide-zinc-100">
                        {bebidasRanking.length === 0 ? (
                            <p className="text-zinc-500 text-sm py-4 text-center">Nenhum dado registrado.</p>
                        ) : (
                            bebidasRanking.map((item, idx) => (
                                <div key={idx} className="py-3.5 flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-bold text-[#3B2219]">{idx + 1}. {item.name}</span>
                                        <p className="text-xs text-zinc-500">{item.quantity} unidades vendidas</p>
                                    </div>
                                    <span className="font-extrabold text-[#92400E]">R$ {item.revenue.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white border border-[#E6D5BC] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
                        <div className="flex justify-between items-center p-5 border-b border-zinc-100">
                            <h3 className="text-lg font-bold text-[#3B2219] flex items-center gap-2">
                                <BarChart2 className="text-[#92400E]" size={20} />
                                {activeModal === "weekly" && "Detalhamento Diário (Semana)"}
                                {activeModal === "monthly" && "Detalhamento Semanal (Mês)"}
                                {activeModal === "annual" && "Detalhamento Mensal (Ano)"}
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-3 flex-1">
                            {activeModal === "weekly" && (
                                dailyBreakdown.length === 0 ? <p className="text-zinc-500 text-center py-4">Sem dados</p> :
                                    dailyBreakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-amber-50/50 border border-amber-100 text-sm">
                                            <span className="text-zinc-700 font-medium">{item.label}</span>
                                            <span className="text-[#92400E] font-bold">R$ {item.value.toFixed(2)}</span>
                                        </div>
                                    ))
                            )}

                            {activeModal === "monthly" && (
                                weeklyBreakdown.length === 0 ? <p className="text-zinc-500 text-center py-4">Sem dados</p> :
                                    weeklyBreakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-amber-50/50 border border-amber-100 text-sm">
                                            <span className="text-zinc-700 font-medium">{item.label}</span>
                                            <span className="text-[#92400E] font-bold">R$ {item.value.toFixed(2)}</span>
                                        </div>
                                    ))
                            )}

                            {activeModal === "annual" && (
                                monthlyBreakdown.length === 0 ? <p className="text-zinc-500 text-center py-4">Sem dados</p> :
                                    monthlyBreakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-amber-50/50 border border-amber-100 text-sm">
                                            <span className="text-zinc-700 font-medium">{item.label}</span>
                                            <span className="text-[#92400E] font-bold">R$ {item.value.toFixed(2)}</span>
                                        </div>
                                    ))
                            )}
                        </div>

                        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="px-5 py-2.5 bg-[#FEF3C7] border border-[#FBBF24] text-[#92400E] font-bold rounded-xl hover:bg-[#FDE68A] transition shadow-sm text-sm"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
