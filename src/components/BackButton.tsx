import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    to?: string;
}

export function BackButton({ to }: BackButtonProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-[#F88A49] hover:text-[#D9733A] bg-[#FCBC71]/15 hover:bg-[#FCBC71]/30 p-2.5 rounded-full transition-all duration-200 flex items-center justify-center shadow-sm"
            title="Voltar"
        >
            <ArrowLeft size={24} />
        </button>
    );
}
