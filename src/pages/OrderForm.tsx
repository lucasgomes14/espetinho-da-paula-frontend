import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton.tsx";
import { Title } from "../components/Title.tsx";

interface Product {
    id: number;
    name: string;
    price: number;
    category?: string;
}

export function OrderForm() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("https://espetinho-da-paula-backend.vercel.app/product");
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            }
        }
        fetchProducts();
    }, []);

    const handleQuantityChange = (productId: number, delta: number) => {
        setQuantities((prev) => {
            const currentQty = prev[productId] || 0;
            const newQty = Math.max(0, currentQty + delta);
            return {
                ...prev,
                [productId]: newQty,
            };
        });
    };

    const handleSubmitOrder = async () => {
        const itemsToSubmit = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, quantity]) => ({
                productId: Number(productId),
                quantity: Number(quantity),
            }));

        if (itemsToSubmit.length === 0) {
            alert("Selecione pelo menos um item.");
            return;
        }

        setLoading(true);

        try {
            const tableResponse = await fetch(
                "https://espetinho-da-paula-backend.vercel.app/tables"
            );
            const tables = await tableResponse.json();
            const currentTable = tables.find((t: any) => t.id === Number(tableId));
            const activeOrderId = currentTable?.activeOrder?.id;

            let response;

            if (activeOrderId) {
                response = await fetch(
                    `https://espetinho-da-paula-backend.vercel.app/orders/${activeOrderId}/items`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            items: itemsToSubmit, // <--- Aqui vai o array que o novo DTO do backend espera
                        }),
                    }
                );
            } else {
                response = await fetch(
                    "https://espetinho-da-paula-backend.vercel.app/orders",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            tableId: Number(tableId),
                            items: itemsToSubmit,
                        }),
                    }
                );
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao salvar o pedido.");
            }

            alert("Pedido salvo com sucesso!");
            navigate("/table");
        } catch (error: any) {
            console.error("Erro no envio do pedido:", error);
            alert(error.message || "Erro ao processar a comanda. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const sortedProducts = [...products].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
    );

    const groupedProducts = sortedProducts.reduce((acc, product) => {
        const category = product.category || "Geral";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as { [key: string]: Product[] });

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-24 px-4 pb-12">
            <BackButton to={"/table"} />
            <Title />

            <div className="w-full max-w-2xl mt-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-[#3B2219] mb-4 text-center">
                    Novo Pedido - Mesa {tableId}
                </h2>

                <div className="flex-1 overflow-y-auto space-y-6 pr-1 bg-white/40 p-4 rounded-2xl border border-[#E6D5BC] shadow-sm max-h-[60vh]">
                    {Object.keys(groupedProducts).length === 0 ? (
                        <p className="text-center text-zinc-600 py-8">Carregando produtos...</p>
                    ) : (
                        Object.entries(groupedProducts).map(([category, items]) => (
                            <div key={category} className="space-y-3">
                                <h3 className="text-md font-bold text-[#3B2219] border-b border-[#E6D5BC] pb-1 uppercase tracking-wider">
                                    {category}
                                </h3>

                                {items.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E6D5BC] shadow-xs"
                                    >
                                        <div>
                                            <span className="font-semibold text-[#3B2219] block">{product.name}</span>
                                            <span className="text-xs text-zinc-600">
                        R$ {Number(product.price || 0).toFixed(2)}
                      </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(product.id, -1)}
                                                className="w-9 h-9 bg-zinc-100 rounded-lg font-bold text-zinc-700 hover:bg-zinc-200 flex items-center justify-center transition cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-bold text-[#3B2219]">
                        {quantities[product.id] || 0}
                      </span>
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(product.id, 1)}
                                                className="w-9 h-9 bg-[#FEF3C7] border border-[#FBBF24] rounded-lg font-bold text-[#92400E] hover:bg-[#FDE68A] flex items-center justify-center transition cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => navigate("/table")}
                        className="flex-1 py-3.5 bg-zinc-200 text-zinc-800 font-bold rounded-xl hover:bg-zinc-300 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmitOrder}
                        disabled={loading}
                        className="flex-1 py-3.5 bg-[#FBBF24] text-[#92400E] font-bold rounded-xl hover:bg-[#F59E0B] transition shadow-md disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Confirmar Pedido"}
                    </button>
                </div>
            </div>
        </div>
    );
}
