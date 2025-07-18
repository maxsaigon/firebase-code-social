'use client';

import React, { useState } from 'react';
import { useServices } from '@/hooks/useServices';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import UserServiceCard from '@/components/shared/UserServiceCard';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OrderForm } from '@/components/OrderForm';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: services, isLoading, error } = useServices();
  const createOrderMutation = useCreateOrder();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleOrderService = (service: Service) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    setSelectedService(service);
    setIsOrderModalOpen(true);
  };

  const handleCreateOrder = async (data: { quantity: number; notes?: string }) => {
    if (!user || !selectedService) return;

    try {
      const total_amount = selectedService.price * data.quantity;
      
      await createOrderMutation.mutateAsync({
        user_id: user.id,
        service_id: selectedService.id,
        quantity: data.quantity,
        unit_price: selectedService.price,
        total_amount: total_amount,
        notes: data.notes,
      });
      
      setIsOrderModalOpen(false);
      setSelectedService(null);
      
      toast({
        title: "Success",
        description: "Order placed successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading services: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Services</h1>
          <p className="text-gray-600">Browse and order our digital services.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <div key={service.id} className="relative">
            <UserServiceCard service={service} />
            <div className="mt-4">
              <Button 
                onClick={() => handleOrderService(service)}
                className="w-full"
                disabled={!service.is_active}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {service.is_active ? 'Order Now' : 'Unavailable'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(!services || services.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services available at the moment.</p>
        </div>
      )}

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Service</DialogTitle>
            <DialogDescription>
              {selectedService ? `Order ${selectedService.name}` : 'Order Service'}
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <OrderForm
              serviceName={selectedService.name}
              unitPrice={selectedService.price}
              onSubmit={handleCreateOrder}
              isSubmitting={createOrderMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
