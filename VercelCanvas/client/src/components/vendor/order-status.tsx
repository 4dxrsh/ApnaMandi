import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { OrderWithItems } from "@shared/schema";

const statusConfig = {
  'PLACED': { 
    icon: '✓', 
    label: 'Placed', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    description: 'Order received'
  },
  'PROCURING': { 
    icon: '🛒', 
    label: 'Procuring', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    description: 'Getting your items'
  },
  'ON_THE_WAY': { 
    icon: '🚛', 
    label: 'On The Way', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100',
    description: 'Out for delivery'
  },
  'DELIVERED': { 
    icon: '🎁', 
    label: 'Delivered', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    description: 'Order completed'
  }
};

const statusOrder = ['PLACED', 'PROCURING', 'ON_THE_WAY', 'DELIVERED'];

export default function OrderStatus() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders/user', user?.id],
    enabled: !!user?.id,
  });

  const currentOrder = orders.find(order => order.status !== 'DELIVERED');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentOrder) {
    return (
      <Card>
        <CardHeader className="partner-gradient text-white">
          <CardTitle className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No active orders</p>
            <p className="text-sm">Place an order to track its status</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStatusIndex = statusOrder.indexOf(currentOrder.status || 'PLACED');

  return (
    <Card>
      <CardHeader className="partner-gradient text-white">
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Order Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="text-sm text-gray-600 mb-4">
          Order #{currentOrder.id.slice(-8).toUpperCase()}
        </div>
        
        <div className="space-y-4">
          {statusOrder.map((status, index) => {
            const config = statusConfig[status as keyof typeof statusConfig];
            const isActive = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div key={status} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  isActive 
                    ? isCurrent 
                      ? `${config.bgColor} ${config.color} animate-pulse` 
                      : 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {isActive && index < currentStatusIndex ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm">{config.icon}</span>
                  )}
                </div>
                <div>
                  <div className={`font-medium ${isActive ? config.color : 'text-gray-500'}`}>
                    {config.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isCurrent ? config.description : isActive ? 'Completed' : 'Pending'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
