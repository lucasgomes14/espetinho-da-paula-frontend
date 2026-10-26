import type {OrderItem} from "./OrderItem.ts";

export interface Order {
    id: number;
    tableNumber: number;
    status: string;
    totalAmount: number;
    items: OrderItem[];
    createdAt?: string;
}
