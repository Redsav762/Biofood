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
  pickupTime: string;
  specialInstructions?: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export default function Order() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    phone: "",
    pickupTime: "",
  });
  const [cart, setCart] = useState<CartItem[]>([]);

  // Calculate earliest possible pickup time (30 minutes from now, after 10:00 AM)
  const getMinPickupTime = () => {
    const now = new Date();
    const openingTime = new Date(now);
    openingTime.setHours(10, 0, 0); // Set opening time to 10:00

    // If current time is before opening time, return opening time
    if (now < openingTime) {
      return {
        time: "10:00",
        message: "Время работы кафе: с 10:00. Минимальное время ожидания заказа: 30 минут"
      };
    }

    // Add 30 minutes to current time
    const minTime = new Date(now);
    minTime.setMinutes(minTime.getMinutes() + 30);

    return {
      time: minTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      message: "Минимальное время ожидания заказа: 30 минут"
    };
  };

  const getMaxPickupTime = () => {
    const now = new Date();
    const closingTime = new Date(now);
    closingTime.setHours(22, 0, 0); // Set closing time to 22:00
    return closingTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };


  // Load cart data from sessionStorage on component mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cartData');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
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
        items: cart.map(({ item, quantity, notes }) => ({
          menuItemId: item.id,
          quantity,
          notes: notes || "",
        })),
        total: cart.reduce(
          (sum, { item, quantity }) => sum + item.price * quantity,
          0
        ),
        pickupTime: formData.pickupTime,
        specialInstructions: formData.specialInstructions,
      });
      const orderData: Order = await orderResponse.json();
      return orderData;
    },
    onSuccess: (data) => {
      sessionStorage.removeItem('cartData');
      toast({
        title: "Заказ успешно оформлен!",
        description: `Ваш заказ #${data.id} принят. Время получения: ${formData.pickupTime}`,
      });
      setLocation("/menu");
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось оформить заказ. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.pickupTime) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля.",
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
      <h1 className="text-3xl font-bold">Оформление заказа</h1>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
        {cart.map(({ item, quantity, notes }) => (
          <div key={item.id} className="py-2">
            <div className="flex justify-between">
              <span>
                {quantity}x {item.name}
              </span>
              <span>
                {(item.price * quantity).toLocaleString("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                })}
              </span>
            </div>
            {notes && (
              <p className="text-sm text-muted-foreground mt-1">
                Комментарий: {notes}
              </p>
            )}
          </div>
        ))}
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between font-semibold">
            <span>Итого</span>
            <span>
              {cart
                .reduce(
                  (sum, { item, quantity }) => sum + item.price * quantity,
                  0
                )
                .toLocaleString("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                })}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Имя *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Input
            placeholder="Телефон *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email (необязательно)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <Input
            type="time"
            min={getMinPickupTime().time}
            max={getMaxPickupTime()}
            required
            value={formData.pickupTime}
            onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {getMinPickupTime().message}
          </p>
        </div>
        <div>
          <Textarea
            placeholder="Дополнительные инструкции (необязательно)"
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
          {orderMutation.isPending ? "Оформление заказа..." : "Оформить заказ"}
        </Button>
      </form>
    </div>
  );
}