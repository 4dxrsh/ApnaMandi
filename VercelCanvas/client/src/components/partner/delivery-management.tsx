import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OrderWithItems } from "@shared/schema";

export default function DeliveryManagement() {
  const { toast } = useToast();
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
  });

  const markDeliveredMutation = useMutation({
    mutationFn: async ({ orderId, paymentReceived }: { orderId: string; paymentReceived: string }) => {
      const response = await apiRequest('POST', '/api/partner/mark-delivered', {
        orderId,
        paymentReceived: parseFloat(paymentReceived)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Delivered",
        description: "Order has been marked as delivered successfully.",
      });
      setPaymentAmounts({});
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark order as delivered. Please try again.",
        variant: "destructive",
      });
    },
  });

  const activeOrders = orders.filter(order => order.status !== 'DELIVERED');

  const handleMarkDelivered = (orderId: string) => {
    const paymentAmount = paymentAmounts[orderId];
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }
    markDeliveredMutation.mutate({ orderId, paymentReceived: paymentAmount });
  };

  const handlePaymentChange = (orderId: string, value: string) => {
    setPaymentAmounts(prev => ({ ...prev, [orderId]: value }));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ON_THE_WAY':
        return 'bg-orange-100 text-orange-800';
      case 'PROCURING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PLACED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="vendor-gradient text-white">
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
          </svg>
          Delivery Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {activeOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
            </svg>
            <p>No orders for delivery</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {order.user?.name || 'Unknown Customer'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">₹{order.total}</div>
                    <div className="text-sm text-gray-500">Total Bill</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  {order.items.map(item => 
                    `${item.product.name}: ${item.quantity}${item.product.unit}`
                  ).join(', ')}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleMarkDelivered(order.id)}
                      disabled={markDeliveredMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {markDeliveredMutation.isPending ? 'Marking...' : 'Mark Delivered'}
                    </Button>
                    <Input
                      type="number"
                      placeholder={order.total?.toString() || '0'}
                      value={paymentAmounts[order.id] || ''}
                      onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                      className="w-24"
                      step="0.01"
                    />
                    <span className="text-sm text-gray-600">₹ received</span>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(order.status || 'PLACED')}`}>
                    {(order.status || 'PLACED').replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
