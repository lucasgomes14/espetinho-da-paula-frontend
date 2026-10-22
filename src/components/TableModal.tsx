import { type TableItem } from "../hooks/useTables";
import { useNavigate } from "react-router-dom";

interface TableModalProps {
    table: TableItem;
    onClose: () => void;
}

export function TableModal({ table, onClose }: TableModalProps) {
    const navigate = useNavigate();

    const handleChoice = (accept: boolean) => {
        onClose();
        if (accept) {
            navigate(`/tables/${table.id}/order`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#FFF7E2] rounded-2xl p-6 w-full max-w-sm shadow-xl border-2 border-[#D9C3A3] flex flex-col items-center">
                <h3 className="text-xl font-bold text-[#3B2219] mb-3 text-center">
                    Mesa {table.number}
                </h3>

                <p className="text-[#3B2219] text-center font-medium mb-6">
                    Esta mesa está livre. Deseja abrir uma comanda para ela?
                </p>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={() => handleChoice(false)}
                        className="flex-1 py-3 bg-zinc-200 text-zinc-800 font-bold rounded-xl hover:bg-zinc-300 transition"
                    >
                        Não
                    </button>
                    <button
                        onClick={() => handleChoice(true)}
                        className="flex-1 py-3 bg-[#FEF3C7] border border-[#FBBF24] text-[#92400E] font-bold rounded-xl hover:bg-[#FDE68A] transition shadow-sm"
                    >
                        Sim
                    </button>
                </div>
            </div>
        </div>
    );
}
