export interface KitchenItem {
    orderId: number;
    tableNumber: number;
    productId: number;
    productName: string;
    quantity: number;
    category?: string;
    status: "PENDING" | "DELIVERED";
    createdAt?: string;
}
