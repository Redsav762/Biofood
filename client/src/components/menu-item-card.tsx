import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type MenuItem } from "@shared/schema";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAddToOrder }: MenuItemCardProps) {
  const formattedPrice = (item.price / 100).toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
  });

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        <p className="text-lg font-medium mt-2">{formattedPrice}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => onAddToOrder(item)}
          disabled={!item.available}
        >
          {item.available ? "Добавить в заказ" : "Нет в наличии"}
        </Button>
      </CardFooter>
    </Card>
  );
}