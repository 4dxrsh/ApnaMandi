import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Navigation from "@/components/ui/navigation";
import OrderForm from "@/components/vendor/order-form";
import OrderStatus from "@/components/vendor/order-status";
import OrderHistory from "@/components/vendor/order-history";

export default function VendorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'VENDOR') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  if (!user || user.role !== 'VENDOR') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Place New Order */}
          <div className="lg:col-span-2">
            <OrderForm />
          </div>
          
          {/* Order Status & History */}
          <div className="space-y-6">
            <OrderStatus />
            <OrderHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
