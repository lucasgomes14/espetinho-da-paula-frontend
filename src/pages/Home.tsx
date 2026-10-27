import { MenuButton } from "../components/MenuButton.tsx";
import {BookOpenText, ChartNoAxesCombined, Coffee, LayoutGrid, Pencil, SquareMenu} from "lucide-react";
import {Title} from "../components/Title.tsx";

export function Home() {
    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-32">
            <Title />

            <main className="mt-32 mb-16">
                <div className="grid grid-cols-2 gap-8">
                    <MenuButton to="/table" title="Mesas" icon={<LayoutGrid size={24} /> } />
                    <MenuButton to="/order-ticket" title="Comanda" icon={<SquareMenu size={24} /> } />
                    <MenuButton to="/waiter" title="Garçom" icon={<Pencil size={24} /> } />
                    <MenuButton to="/kitchen" title="Cozinha" icon={<Coffee size={24} /> } />
                    <MenuButton to="/menu" title="Cardápio" icon={<BookOpenText size={24} /> } />
                    <MenuButton to="/metrics" title="Métricas" icon={<ChartNoAxesCombined size={24} /> } />
                </div>
            </main>
        </div>
    )
}
