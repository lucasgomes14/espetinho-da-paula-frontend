import React from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { type KitchenItem } from "../types/Kitchen";
import { useLongPress } from "../hooks/useLongPress";

interface KitchenCardProps {
    item: KitchenItem;
    onSelect: (item: KitchenItem) => void;
}

export const KitchenCard: React.FC<KitchenCardProps> = ({ item, onSelect }) => {
    const isPending = item.status === "PENDING";

    const longPressProps = useLongPress({
        onLongPress: () => onSelect(item),
        onClick: () => onSelect(item),
    });

    return (
        <div
            {...longPressProps}
            className={`p-4 rounded-2xl border transition shadow-xs hover:shadow-md cursor-pointer select-none flex flex-col justify-between ${
                isPending
                    ? "bg-amber-50/80 border-amber-200 text-[#3B2219]"
                    : "bg-emerald-50/60 border-emerald-200 text-zinc-600 opacity-80"
            }`}
        >
            <div className="flex justify-between items-center mb-3">
                <span className="font-extrabold text-lg text-[#3B2219]">
                    Mesa {item.tableNumber}
                </span>
                <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                        isPending
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                >
                    {isPending ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                    {isPending ? "Pendente" : "Entregue"}
                </span>
            </div>

            <div className="my-2">
                <div className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <span className="bg-[#3B2219] text-white text-base px-2 py-0.5 rounded-lg font-black">
                        {item.quantity}x
                    </span>
                    {item.productName}
                </div>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-200/60 text-[11px] text-zinc-400 flex justify-between items-center">
                <span>Toque/segure p/ opções</span>
                <span>Comanda #{item.orderId}</span>
            </div>
        </div>
    );
};
