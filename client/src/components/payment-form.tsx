import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    paymentMethod: string;
  }) => void;
  isProcessing: boolean;
}

export default function PaymentForm({ amount, onSubmit, isProcessing }: PaymentFormProps) {
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    paymentMethod: "card",
  });

  const prepaymentAmount = Math.floor(amount * 0.5); // 50% от суммы заказа

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (paymentData.cardNumber.length !== 16) {
      toast({
        title: "Ошибка",
        description: "Неверный номер карты",
        variant: "destructive",
      });
      return;
    }

    onSubmit(paymentData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Способ оплаты</Label>
            <RadioGroup
              defaultValue="card"
              onValueChange={(value) =>
                setPaymentData({ ...paymentData, paymentMethod: value })
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Карта</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Наличные</Label>
              </div>
            </RadioGroup>
          </div>

          {paymentData.paymentMethod === "card" && (
            <>
              <div>
                <Label>Номер карты</Label>
                <Input
                  type="text"
                  maxLength={16}
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      cardNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Срок действия</Label>
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={paymentData.expiryDate}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        expiryDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        cvv: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="text-lg font-semibold">
              Предоплата (50%):{" "}
              {prepaymentAmount.toLocaleString("ru-RU", {
                style: "currency",
                currency: "RUB",
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              Оставшаяся сумма:{" "}
              {prepaymentAmount.toLocaleString("ru-RU", {
                style: "currency",
                currency: "RUB",
              })}
              {" "}оплачивается при получении заказа
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Обработка..." : "Оплатить предоплату"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}