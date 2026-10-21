import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton.tsx";

interface Category {
    id: number;
    name: string;
}

export function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://espetinho-da-paula-backend.vercel.app/category")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data);
                } else if (data && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                } else {
                    setCategories([]);
                }
            })
            .catch(error => console.error("Erro ao buscar categorias:", error));

        if (id) {
            fetch(`https://espetinho-da-paula-backend.vercel.app/product/${id}`)
                .then(res => res.json())
                .then(product => {
                    setName(product.name || "");
                    setPrice(product.price ? product.price.toString() : "");
                    setCategoryId(product.categoryId ? product.categoryId.toString() : (product.category ? product.category.toString() : ""));
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Erro ao buscar produto:", error);
                    alert("Erro ao carregar dados do produto.");
                    setLoading(false);
                });
        }
    }, [id]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const productData = {
            name,
            price: parseFloat(price),
            categoryId: parseInt(categoryId)
        };

        try {
            const response = await fetch(`https://espetinho-da-paula-backend.vercel.app/product/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert("Produto atualizado com sucesso!");
                navigate("/Menu");
            } else {
                console.error("O backend recusou a atualização:", await response.text());
                alert("Erro ao atualizar produto!");
            }
        } catch (error) {
            alert("Erro de conexão!");
            console.error("Erro ao atualizar produto:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex items-center justify-center font-['Inter']">
                <span className="text-[#F88A49] font-bold text-lg">Carregando dados do produto...</span>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] px-6 py-12 relative">

            <BackButton to={"/Menu"} />

            <header className="mb-10 text-center mt-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#F88A49]">
                    Editar Produto
                </h1>
                <p className="text-gray-600 text-sm mt-1">Altere os dados desejados do produto</p>
            </header>

            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/50 border border-[#FCBC71]/60 p-6 rounded-3xl shadow-sm flex flex-col gap-5">

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-gray-700 font-semibold text-sm">
                        Nome do produto
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Ex: Espetinho de Carne"
                        className="p-3.5 rounded-2xl bg-[#FFF7E2]/60 border border-[#FCBC71] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F88A49] focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="price" className="text-gray-700 font-semibold text-sm">
                        Preço (R$)
                    </label>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        placeholder="0,00"
                        className="p-3.5 rounded-2xl bg-[#FFF7E2]/60 border border-[#FCBC71] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F88A49] focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="category" className="text-gray-700 font-semibold text-sm">
                        Categoria
                    </label>
                    <select
                        id="category"
                        name="categoryId"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        className="p-3.5 rounded-2xl bg-[#FFF7E2]/60 border border-[#FCBC71] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F88A49] focus:border-transparent transition-all cursor-pointer"
                    >
                        <option value="" disabled>Selecione uma categoria...</option>
                        {categories && categories.length > 0 && categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="mt-4 w-full bg-[#F88A49] hover:bg-[#E07536] text-[#FFF7E2] font-bold py-4 rounded-2xl active:scale-95 transition-all duration-200 shadow-md"
                >
                    Atualizar Produto
                </button>
            </form>
        </div>
    );
}
