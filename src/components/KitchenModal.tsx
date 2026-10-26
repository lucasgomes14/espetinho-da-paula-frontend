import React from "react";
import { X, CheckCircle2, RotateCcw } from "lucide-react";
import { type KitchenItem } from "../types/Kitchen";

interface KitchenModalProps {
    item: KitchenItem | null;
    onClose: () => void;
    onToggleStatus: (item: KitchenItem, status: "PENDING" | "DELIVERED") => void;
}

export const KitchenModal: React.FC<KitchenModalProps> = ({
                                                              item,
                                                              onClose,
                                                              onToggleStatus,
                                                          }) => {
    if (!item) return null;

    const isPending = item.status === "PENDING";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-[#E6D5BC] flex flex-col relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-full"
                >
                    <X size={20} />
                </button>

                <div className="text-center pb-3 border-b border-zinc-100 mb-4">
                    <h3 className="text-lg font-bold text-[#3B2219]">
                        Mesa {item.tableNumber}
                    </h3>
                    <p className="text-sm font-semibold text-zinc-800 mt-1">
                        {item.quantity}x {item.productName}
                    </p>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    {isPending ? (
                        <button
                            onClick={() => onToggleStatus(item, "DELIVERED")}
                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={18} />
                            <span>Marcar como Entregue</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => onToggleStatus(item, "PENDING")}
                            className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition shadow-sm flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} />
                            <span>Mover para Pendente</span>
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};
