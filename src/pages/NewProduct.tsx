import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton.tsx";
import type {Category} from "../types/Category.ts";


export function NewProduct() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetch("https://espetinho-da-paula-backend.vercel.app/category")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data);
                } else if (data && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                } else {
                    console.error("A API não retornou uma lista válida:", data);
                    setCategories([]);
                }
            })
            .catch(error => console.error("Erro ao buscar categorias:", error));
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const productData: Record<string, any> = Object.fromEntries(formData);

        productData.price = parseFloat(productData.price);
        productData.categoryId = parseInt(productData.categoryId);

        try {
            const response = await fetch("https://espetinho-da-paula-backend.vercel.app/product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            if(response.ok) {
                alert("Produto guardado com sucesso!");
                navigate("/menu");
            } else {
                console.error("O backend recusou os dados:", await response.text());
                alert("Erro ao salvar! Verifique o console.");
            }
        } catch(error) {
            alert("Erro de conexão!");
            console.error("Erro ao guardar produto:", error);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] px-6 py-12 relative">

            <BackButton to={"/menu"} />

            <header className="mb-10 text-center mt-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#F88A49]">
                    Novo Produto
                </h1>
                <p className="text-gray-600 text-sm mt-1">Preencha os dados para cadastrar no cardápio</p>
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
                        required
                        defaultValue=""
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
                    Salvar Produto
                </button>
            </form>
        </div>
    );
}
