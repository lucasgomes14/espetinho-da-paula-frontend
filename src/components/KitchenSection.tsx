import React from "react";
import { type KitchenItem } from "../types/Kitchen";
import { KitchenCard } from "./KitchenCard";

interface KitchenSectionProps {
    title: string;
    icon: React.ReactNode;
    items: KitchenItem[];
    onSelectItem: (item: KitchenItem) => void;
}

export const KitchenSection: React.FC<KitchenSectionProps> = ({
                                                                  title,
                                                                  icon,
                                                                  items,
                                                                  onSelectItem,
                                                              }) => {
    if (items.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h3 className="text-lg font-bold text-[#3B2219]">
                    {title} ({items.length})
                </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                    <KitchenCard
                        key={`${item.orderId}-${item.productName}`}
                        item={item}
                        onSelect={onSelectItem}
                    />
                ))}
            </div>
        </div>
    );
};
