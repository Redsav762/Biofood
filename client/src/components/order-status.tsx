import { Badge } from "@/components/ui/badge";
import { type Order } from "@shared/schema";

const statusColors = {
  pending: "bg-yellow-500",
  preparing: "bg-blue-500",
  ready: "bg-green-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
};

interface OrderStatusProps {
  order: Order;
  className?: string;
}

export default function OrderStatus({ order, className }: OrderStatusProps) {
  return (
    <Badge
      variant="secondary"
      className={`${statusColors[order.status as keyof typeof statusColors]} ${
        className || ""
      }`}
    >
      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
    </Badge>
  );
}
