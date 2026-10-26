import { BackButton } from "../components/BackButton.tsx";
import { Utensils, Clock, CheckCircle2 } from "lucide-react";
import { useKitchen } from "../hooks/useKitchen";
import { KitchenSection } from "../components/KitchenSection";
import { KitchenModal } from "../components/KitchenModal";

export function Kitchen() {
    const {
        items,
        pendingItems,
        deliveredItems,
        loading,
        selectedItem,
        setSelectedItem,
        handleToggleStatus,
    } = useKitchen();

    return (
        <div className="min-h-[100dvh] w-full bg-[#FFF7E2] flex flex-col items-center font-['Inter'] pt-24 px-4 pb-12">
            <BackButton to={"/"} />

            <div className="flex items-center gap-3 mb-6">
                <Utensils className="text-[#3B2219]" size={28} />
                <h2 className="text-2xl font-bold text-[#3B2219] text-center">
                    Cozinha - Acompanhamentos
                </h2>
            </div>

            {loading ? (
                <p className="text-zinc-600">Carregando acompanhamentos...</p>
            ) : items.length === 0 ? (
                <p className="text-zinc-500">Nenhum acompanhamento no momento.</p>
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
