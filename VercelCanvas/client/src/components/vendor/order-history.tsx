import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OrderWithItems } from "@shared/schema";

export default function OrderHistory() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders/user', user?.id],
    enabled: !!user?.id,
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { productId: string; quantity: number }[]) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-id': user?.id || ''
        },
        body: JSON.stringify({ items }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reorder Placed!",
        description: "Your order has been successfully placed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place reorder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const previousOrders = orders
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 10);

  const handleReorder = (order: OrderWithItems) => {
    const items = order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    reorderMutation.mutate(items);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
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
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Order History
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {previousOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <p>No orders yet</p>
            <p className="text-sm">Your order history will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {previousOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(order.status || 'PLACED')}`}>
                    {(order.status || 'PLACED').replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {order.items.map(item => `${item.product.name} ${item.quantity}${item.product.unit}`).join(', ')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    ₹{order.total}
                  </span>
                  {order.status === 'DELIVERED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(order)}
                      disabled={reorderMutation.isPending}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {reorderMutation.isPending ? 'Placing...' : 'Reorder'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
