import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ProcurementItem {
  productId: string;
  productName: string;
  totalQuantity: number;
  unit: string;
}

export default function ProcurementList() {
  const { toast } = useToast();
  const [prices, setPrices] = useState<Record<string, string>>({});

  const { data: procurementList = [], isLoading } = useQuery<ProcurementItem[]>({
    queryKey: ['/api/partner/procurement-list'],
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ productId, price }: { productId: string; price: string }) => {
      const response = await apiRequest('POST', '/api/partner/set-price', {
        productId,
        price: parseFloat(price)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Price Updated",
        description: "Market price has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/procurement-list'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update price. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdatePrice = (productId: string) => {
    const price = prices[productId];
    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }
    updatePriceMutation.mutate({ productId, price });
  };

  const handlePriceChange = (productId: string, value: string) => {
    setPrices(prev => ({ ...prev, [productId]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  <div className="h-10 bg-gray-200 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="partner-gradient text-white">
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          Today's Procurement List
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {procurementList.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <p>No items to procure today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Qty</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Market Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {procurementList.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.totalQuantity} {item.unit}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">₹</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={prices[item.productId] || ''}
                          onChange={(e) => handlePriceChange(item.productId, e.target.value)}
                          className="w-20"
                          step="0.01"
                        />
                        <span className="text-gray-600 ml-2">/{item.unit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        onClick={() => handleUpdatePrice(item.productId)}
                        disabled={updatePriceMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updatePriceMutation.isPending ? 'Updating...' : 'Update'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
