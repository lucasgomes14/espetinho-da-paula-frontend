import {Link} from "react-router-dom";

interface MenuButtonProps {
    to: string;
    title: string;
    icon: React.ReactNode;
}

export function MenuButton({ to, title, icon }: MenuButtonProps) {
    return (
        <Link to={to}
        className="bg-[#FCBC71] hover:bg-[#D9A261] active:bg-[#D9A261] transition-all duration-300 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm no-underline p-8">
            <h2 className="text-[#FFF7E2] capitalize font-bold text-xl">
                {title}
            </h2>
            <div className=" bg-[#FCBC71]/40 rounded-md flex items-center justify-center text-[#FFF7E2] mt-2">
                {icon}
            </div>
        </Link>
    )
}
