import {Title} from "../components/Title.tsx";
import {MenuList} from "../components/MenuList.tsx";
import {useNavigate} from "react-router-dom";
import {Plus} from "lucide-react";
import {BackButton} from "../components/BackButton.tsx";

export function Menu() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-32">
            <BackButton to={"/"} />
            <Title />
            <MenuList />
            <button
                onClick={() => navigate("/new-product")}
                className="fixed bottom-6 right-6 bg-[#F88A49] hover:bg-[#E07536] text-[#FFF7E2] p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center z-40 active:scale-95"
                title="Cadastrar novo produto"
            >
                <Plus size={28} strokeWidth={2.5} />
            </button>
        </div>
    )
}
