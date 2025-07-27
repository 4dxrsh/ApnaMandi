import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Navigation from "@/components/ui/navigation";
import ProcurementList from "@/components/partner/procurement-list";
import DeliveryManagement from "@/components/partner/delivery-management";
import EarningsSummary from "@/components/partner/earnings-summary";

export default function PartnerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'PARTNER') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  if (!user || user.role !== 'PARTNER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Procurement & Delivery Management */}
          <div className="lg:col-span-2 space-y-6">
            <ProcurementList />
            <DeliveryManagement />
          </div>
          
          {/* Earnings & Stats */}
          <div className="space-y-6">
            <EarningsSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
