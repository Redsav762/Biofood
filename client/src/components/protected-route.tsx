import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type User } from "@shared/schema";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Required role:', requiredRole);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    console.log('ProtectedRoute - No user or error:', error);
    setLocation("/auth");
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute - Role mismatch:', user.role, 'expected:', requiredRole);
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}