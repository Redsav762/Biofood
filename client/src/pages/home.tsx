import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Biofood A8 Café
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Fresh, healthy, and delicious food served with care. Order now for pickup or dine in.
        </p>
        <Button 
          size="lg" 
          onClick={() => setLocation("/menu")}
          className="bg-[#FF6B6B] hover:bg-[#FF5252]"
        >
          View Menu & Order
        </Button>
      </div>

      {/* Featured Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-0">
            <img
              src="https://images.unsplash.com/photo-1485963631004-f2f00b1d6606"
              alt="Fresh Pastries"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">Fresh Pastries</h3>
              <p className="text-muted-foreground">
                Baked fresh daily using organic ingredients
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <img
              src="https://images.unsplash.com/photo-1447078806655-40579c2520d6"
              alt="Premium Coffee"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">Premium Coffee</h3>
              <p className="text-muted-foreground">
                Expertly crafted beverages using locally roasted beans
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <img
              src="https://images.unsplash.com/photo-1494390248081-4e521a5940db"
              alt="Healthy Breakfast"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">Healthy Breakfast</h3>
              <p className="text-muted-foreground">
                Start your day right with our nutritious options
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Café Ambiance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <img
            src="https://images.unsplash.com/photo-1558596602-b09a835e8bc6"
            alt="Café Interior"
            className="w-full h-[400px] object-cover rounded-lg"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">A Perfect Space for Everyone</h2>
          <p className="text-lg text-muted-foreground">
            Whether you're looking for a quiet corner to work, a casual meeting spot,
            or a place to enjoy quality food with friends, Biofood A8 provides the
            perfect ambiance.
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setLocation("/menu")}
          >
            Explore Our Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
