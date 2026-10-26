import { BackButton } from "../components/BackButton.tsx";
import { Clock, CheckCircle2 } from "lucide-react";
import { useWaiter } from "../hooks/useWaiter";
import { KitchenSection } from "../components/KitchenSection";
import { KitchenModal } from "../components/KitchenModal";

export function Waiter() {
    const {
        items,
        pendingItems,
        deliveredItems,
        loading,
        selectedItem,
        setSelectedItem,
        handleToggleStatus,
    } = useWaiter();

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-24 px-4 pb-12">
            <BackButton to={"/"} />

            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-[#3B2219] text-center">
                    Salão - Espetos e Bebidas
                </h2>
            </div>

            {loading ? (
                <p className="text-zinc-600">Carregando espetos e bebidas...</p>
            ) : items.length === 0 ? (
                <p className="text-zinc-500">Nenhum pedido de espeto ou bebida no momento.</p>
            ) : (
                <div className="w-full max-w-4xl flex flex-col gap-4">
                    <KitchenSection
                        title="Pendentes"
                        icon={<Clock size={20} className="text-amber-700" />}
                        items={pendingItems}
                        onSelectItem={setSelectedItem}
                    />

                    <KitchenSection
                        title="Já Entregues"
                        icon={<CheckCircle2 size={20} className="text-emerald-700" />}
                        items={deliveredItems}
                        onSelectItem={setSelectedItem}
                    />
                </div>
            )}

            <KitchenModal
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                onToggleStatus={handleToggleStatus}
            />
        </div>
    );
}
