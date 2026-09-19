import {useEffect, useState} from "react";

export function ProductForm() {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        fetch("https://espetinho-da-paula-backend.vercel.app/category")
            .then(res => res.json())
            .then(data => {
                // Prevenção de quebra: garante que só vamos salvar se for um Array
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const productData = Object.fromEntries(formData);

        productData.price = parseFloat(productData.price)
        productData.categoryId = parseInt(productData.categoryId)

        console.log("Dados prontos para persistir no banco:", productData);
        try {
            const response = await fetch("https://espetinho-da-paula-backend.vercel.app/product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            if(response.ok) {
                alert("Produto guardado com sucesso!");
                event.target.reset();
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
        <div className="w-full flex flex-col items-center font-['Inter'] pt-32">
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="">Nome do produto</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Ex: Espetinho de Carne"
                        className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F88A49] focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1">
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
                        className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F88A49] focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="category" className="text-gray-700 font-semibold text-sm">
                        Categoria
                    </label>
                    <select
                        id="category"
                        name="categoryId"
                        required
                        className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F88A49] focus:border-transparent bg-[#FFF7E2] transition-all bg-transparent"
                    >
                        <option value="" >Selecione uma categoria...</option>
                        {categories && categories.length > 0 && categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="mt-6 w-full bg-[#F88A49] text-white font-bold py-4 rounded-xl active:bg-orange-600 active:scale-95 transition-all duration-200 shadow-sm"
                >
                    Salvar Produto
                </button>
            </form>
        </div>
    )
}
