import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}
