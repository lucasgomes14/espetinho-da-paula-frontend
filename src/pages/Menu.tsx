import {Title} from "../components/Title.tsx";
import {ProductForm} from "../components/ProductForm.tsx";

export function Menu() {
    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-32">
            <Title />
            <ProductForm />
        </div>
    )
}
