import { MenuButton } from "../components/MenuButton.tsx";
import {BookOpenText, ChartNoAxesCombined, Coffee, LayoutGrid, SquareMenu} from "lucide-react";
import {Title} from "../components/Title.tsx";

export function Home() {
    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-32">
            <Title />

            <main className="mt-32">
                <div className="grid grid-cols-2 gap-8">
                    <MenuButton to="/Table" title="Mesas" icon={<LayoutGrid size={24} /> } />
                    <MenuButton to="/OrderTicket" title="Comanda" icon={<SquareMenu size={24} /> } />
                    <MenuButton to="/Kitchen" title="Cozinha" icon={<Coffee size={24} /> } />
                    <MenuButton to="/Menu" title="Cardápio" icon={<BookOpenText size={24} /> } />
                    <MenuButton to="/Metrics" title="Métricas" icon={<ChartNoAxesCombined size={24} /> } />
                </div>
            </main>
        </div>
    )
}
