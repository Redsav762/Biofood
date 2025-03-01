import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { type MenuItem, type Order } from "@shared/schema";

interface OrderFormData {
  name: string;
  phone: string;
  email?: string;
  specialInstructions?: string;
}

export default function Order() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    phone: "",
  });
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number }>>([]);

  // Load cart data from sessionStorage on component mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cartData');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // If no cart data, redirect back to menu
      setLocation("/menu");
    }
  }, [setLocation]);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const userResponse = await apiRequest("POST", "/api/users", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      });
      const userData = await userResponse.json();

      const orderResponse = await apiRequest("POST", "/api/orders", {
        userId: userData.id,
        items: cart.map(({ item, quantity }) => ({
          menuItemId: item.id,
          quantity,
          notes: "",
        })),
        total: cart.reduce(
          (sum, { item, quantity }) => sum + item.price * quantity,
          0
        ),
        specialInstructions: formData.specialInstructions,
      });
      const orderData: Order = await orderResponse.json();
      return orderData;
    },
    onSuccess: (data) => {
      // Clear cart data after successful order
      sessionStorage.removeItem('cartData');
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.id} has been received.`,
      });
      // Redirect back to menu instead of non-existent order details page
      setLocation("/menu");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    orderMutation.mutate();
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Complete Your Order</h1>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cart.map(({ item, quantity }) => (
          <div key={item.id} className="flex justify-between py-2">
            <span>
              {quantity}x {item.name}
            </span>
            <span>
              {((item.price * quantity) / 100).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </span>
          </div>
        ))}
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>
              {(
                cart.reduce(
                  (sum, { item, quantity }) => sum + item.price * quantity,
                  0
                ) / 100
              ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Input
            placeholder="Phone *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email (optional)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <Textarea
            placeholder="Special instructions (optional)"
            value={formData.specialInstructions}
            onChange={(e) =>
              setFormData({ ...formData, specialInstructions: e.target.value })
            }
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={orderMutation.isPending}
        >
          {orderMutation.isPending ? "Placing Order..." : "Place Order"}
        </Button>
      </form>
    </div>
  );
}