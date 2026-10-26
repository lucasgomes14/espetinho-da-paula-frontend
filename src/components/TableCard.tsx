import { type TableItem } from "../hooks/useTables";

interface TableCardProps {
    table: TableItem;
    onClick: (table: TableItem) => void;
}

export function TableCard({ table, onClick }: TableCardProps) {
    return (
        <div
            onClick={() => onClick(table)}
    className={`relative flex flex-col items-center justify-center w-28 h-28 rounded-full shadow-md cursor-pointer transition-transform transform hover:scale-105 border-4 ${
        table.isOccupied
            ? "bg-[#FEE2E2] border-[#EF4444] text-[#991B1B]"
            : "bg-[#FEF3C7] border-[#FBBF24] text-[#B45309]"
    }`}
>
    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
        Mesa
        </span>
        <span className="text-2xl font-bold">{table.number}</span>

        <span
    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
        table.isOccupied
            ? "bg-[#FECACA] text-[#7F1D1D]"
            : "bg-[#FDE68A] text-[#92400E]"
    }`}
>
    {table.isOccupied ? "Ocupada" : "Livre"}
    </span>
    </div>
);
}
