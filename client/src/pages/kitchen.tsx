import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderStatus from "@/components/order-status";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Order, type MenuItem } from "@shared/schema";

const statusFlow = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
};

export default function Kitchen() {
  const { toast } = useToast();

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  if (ordersLoading || menuLoading) {
    return <div>Loading...</div>;
  }

  const itemsMap = new Map(menuItems.map((item) => [item.id, item]));

  const activeOrders = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status)
  );

  const completedOrders = orders.filter(
    (order) => ["completed", "cancelled"].includes(order.status)
  );

  const handleUpdateStatus = (order: Order) => {
    const nextStatus = statusFlow[order.status as keyof typeof statusFlow];
    if (nextStatus) {
      updateStatusMutation.mutate({ orderId: order.id, status: nextStatus });
    }
  };

  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Order #{order.id}</CardTitle>
        <OrderStatus order={order} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {order.items.map((item: any) => {
            const menuItem = itemsMap.get(item.menuItemId);
            return (
              <div key={item.menuItemId} className="flex justify-between">
                <span>
                  {item.quantity}x {menuItem?.name}
                </span>
                {item.notes && (
                  <span className="text-sm text-muted-foreground">
                    Note: {item.notes}
                  </span>
                )}
              </div>
            );
          })}
          {order.specialInstructions && (
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Special Instructions:</strong> {order.specialInstructions}
            </div>
          )}
        </div>
        {!["completed", "cancelled"].includes(order.status) && (
          <Button
            className="mt-4 w-full"
            onClick={() => handleUpdateStatus(order)}
            disabled={updateStatusMutation.isPending}
          >
            Mark as {statusFlow[order.status as keyof typeof statusFlow]}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          {activeOrders.map(renderOrderCard)}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
          {completedOrders.slice(0, 5).map(renderOrderCard)}
        </div>
      </div>
    </div>
  );
}