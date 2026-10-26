import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Pencil, Trash2, X } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    categoryId?: number;
    category?: number;
}

export function MenuList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchProducts = () => {
        setLoading(true);
        axios.get(`${import.meta.env.VITE}/product`)
            .then((response) => {
                const formattedProducts: Product[] = response.data.map((item: any) => ({
                    id: item.id ?? item.ID,
                    name: item.name ?? item.NAME,
                    price: Number(item.price ?? item.PRICE ?? 0),
                    categoryId: item.categoryId ?? item.category ?? item.CATEGORY_ID,
                }));

                setProducts(formattedProducts);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao buscar produtos:", err);
                setError("Não foi possível carregar o cardápio.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleTouchStart = (product: Product) => {
        timerRef.current = setTimeout(() => {
            setSelectedProduct(product);
        }, 600);
    };

    const handleTouchEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        setSelectedProduct(product);
    };

    const handleDeleteProduct = async (id: number) => {
        if (!id) {
            alert("Erro: ID do produto inválido.");
            return;
        }

        if (!confirm("Tem certeza que deseja apagar este produto?")) return;

        try {
            await axios.delete(`${import.meta.env.VITE}/product/${id}`);
            alert("Produto inativado com sucesso!");
            setSelectedProduct(null);
            fetchProducts();
        } catch (err: any) {
            console.error("Erro ao apagar produto:", err);
            const msg = err.response?.data?.message || "Erro ao apagar produto. Tente novamente.";
            alert(msg);
        }
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(null);
        navigate(`/edit-product/${product.id}`);
    };

    const sortAlphabetically = (itemA: Product, itemB: Product) => {
        return (itemA.name || "").localeCompare(itemB.name || "");
    };

    const espetos = products
        .filter((p) => (p.categoryId ?? p.category) === 1)
        .sort(sortAlphabetically);

    const bebidas = products
        .filter((p) => (p.categoryId ?? p.category) === 2)
        .sort(sortAlphabetically);

    const acompanhamentos = products
        .filter((p) => (p.categoryId ?? p.category) === 3)
        .sort(sortAlphabetically);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 text-[#F88A49] font-medium">
                Carregando cardápio...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-12 text-red-500 font-medium">
                {error}
            </div>
        );
    }

    const renderCategorySection = (title: string, items: Product[]) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-8">
                <h3 className="text-xl font-bold text-[#F88A49] mb-4 border-b border-[#FCBC71]/40 pb-2">
                    {title}
                </h3>
                <div className="flex flex-col gap-3">
                    {items.map((product) => (
                        <div
                            key={product.id}
                            onTouchStart={() => handleTouchStart(product)}
                            onTouchEnd={handleTouchEnd}
                            onTouchMove={handleTouchEnd}
                            onMouseDown={() => handleTouchStart(product)}
                            onMouseUp={handleTouchEnd}
                            onMouseLeave={handleTouchEnd}
                            onContextMenu={(e) => handleContextMenu(e, product)}
                            className="bg-[#FCBC71]/20 border border-[#FCBC71] p-4 rounded-2xl flex justify-between items-center shadow-sm select-none cursor-pointer active:scale-[0.98] transition-all"
                        >
                            <div>
                                <h4 className="font-bold text-gray-800 text-base capitalize">{product.name}</h4>
                            </div>
                            <span className="font-extrabold text-[#F88A49] text-base">
                                R$ {Number(product.price).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto font-['Inter'] p-4 relative">
            <h2 className="text-2xl font-bold text-[#F88A49] mb-6 text-center">
                Cardápio de Produtos
            </h2>

            {products.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum produto cadastrado ainda.</p>
            ) : (
                <div>
                    {renderCategorySection("Espetos", espetos)}
                    {renderCategorySection("Bebidas", bebidas)}
                    {renderCategorySection("Acompanhamentos", acompanhamentos)}
                </div>
            )}

            {selectedProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#FFF7E2] border border-[#FCBC71] p-6 rounded-3xl shadow-xl w-full max-w-sm flex flex-col gap-4 relative">

                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-2">
                            <h3 className="text-lg font-bold text-gray-800 capitalize">
                                {selectedProduct.name}
                            </h3>
                            <p className="text-sm text-[#F88A49] font-semibold">
                                R$ {Number(selectedProduct.price).toFixed(2)}
                            </p>
                        </div>

                        <button
                            onClick={() => handleEditProduct(selectedProduct)}
                            className="w-full bg-[#FCBC71] hover:bg-[#D9A261] text-[#FFF7E2] font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                        >
                            <Pencil size={20} />
                            <span>Editar Produto</span>
                        </button>

                        <button
                            onClick={() => handleDeleteProduct(selectedProduct.id)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                        >
                            <Trash2 size={20} />
                            <span>Apagar Produto</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
