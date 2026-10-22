import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton.tsx";
import { Title } from "../components/Title.tsx";
import { TableCard } from "../components/TableCard.tsx";
import { useTables, type TableItem } from "../hooks/useTables.ts";
import { TableModal } from "../components/TableModal.tsx";

export function Table() {
    const { tables, loading } = useTables();
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
    const navigate = useNavigate();

    const handleTableClick = (table: TableItem) => {
        if (table.isOccupied) {
            navigate(`/tables/${table.id}/order`);
        } else {
            setSelectedTable(table);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-24 px-4 pb-12">
            <BackButton to={"/"} />
            <Title />

            <div className="w-full max-w-4xl mt-8 flex flex-col items-center">
                <h2 className="text-xl font-bold text-[#3B2219] mb-6 text-center">
                    Gerenciamento de Mesas
                </h2>

                {loading ? (
                    <p className="text-center text-zinc-600">Carregando mesas...</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center w-full">
                        {tables.map((table) => (
                            <TableCard
                                key={table.id}
                                table={table}
                                onClick={handleTableClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedTable && (
                <TableModal
                    table={selectedTable}
                    onClose={() => setSelectedTable(null)}
                />
            )}
        </div>
    );
}
