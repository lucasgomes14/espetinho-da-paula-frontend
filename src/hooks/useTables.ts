import { useState, useEffect, useCallback } from "react";

export interface TableItem {
    id: number;
    number: number;
    isOccupied: boolean;
    activeOrder?: {
        id: number;
        items: {
            productName: string;
            quantity: number;
            price: number;
        }[];
    } | null;
}

export function useTables() {
    const [tables, setTables] = useState<TableItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchTables = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/tables`);
            const data = await response.json();
            setTables(data);
        } catch (error) {
            console.error("Erro ao buscar mesas:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function load() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/tables`);
                const data = await response.json();
                if (isMounted) setTables(data);
            } catch (error) {
                console.error("Erro ao buscar mesas:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    return { tables, loading, refetch: fetchTables };
}
