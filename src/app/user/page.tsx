'use client';

import React, { useState } from 'react';
import { useServices } from '@/hooks/useServices';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ServiceCard from '@/app/admin/services/ServiceCard';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OrderForm } from '@/components/OrderForm';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';
import { addFundApi } from '@/api/addFundApi';
import { transactionApi } from '@/api/transactionApi';

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
        title: "Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }
    setSelectedService(service);
    setIsOrderModalOpen(true);
  };

  const handleCreateOrder = async (data: { quantity: number; notes?: string }) => {
    console.log("handleCreateOrder: Function started.");
    if (!user || !selectedService) {
      console.log("handleCreateOrder: User or selectedService is missing.");
      return;
    }

    const totalAmount = data.quantity * selectedService.price;
    console.log("handleCreateOrder: Total amount calculated:", totalAmount);

    try {
      // 1. Check wallet balance
      console.log("handleCreateOrder: Checking wallet balance...");
      let wallet;
      try {
        const walletResult = await addFundApi.getWallet(user.id);
        wallet = walletResult; // Directly assign the result
        console.log("handleCreateOrder: Wallet data received:", wallet);

        if (!wallet) {
          console.error("handleCreateOrder: No wallet found for user");
          toast({
            title: "Error",
            description: "No wallet found for user",
            variant: "destructive",
          });
          setIsOrderModalOpen(false);
          return;
        }

      } catch (walletError: unknown) {
        console.error("handleCreateOrder: Error fetching wallet:", walletError);
        toast({
          title: "Error",
          description: "Failed to check wallet balance. Please try again.",
          variant: "destructive",
        });
        setIsOrderModalOpen(false);
        return;
      }

      if (wallet!.balance < totalAmount) {
        console.warn("handleCreateOrder: Insufficient wallet balance.");
        toast({
          title: "Error",
          description: "Insufficient wallet balance. Please add funds.",
          variant: "destructive",
        });
        setIsOrderModalOpen(false);
        return;
      }
      console.log("handleCreateOrder: Wallet balance sufficient.");

      // 2. Create Order
      console.log("handleCreateOrder: Creating order...");
      const newOrder = await createOrderMutation.mutateAsync({
        user_id: user.id,
        service_id: selectedService.id,
        quantity: data.quantity,
        unit_price: selectedService.price,
        total_amount: totalAmount,
        status: 'pending', // Always pending initially
        notes: data.notes,
      });
      console.log("handleCreateOrder: New order created:", newOrder);

      // 3. Create Payment Transaction
      console.log("handleCreateOrder: Creating payment transaction...");
      await transactionApi.createTransaction({
        user_id: user.id,
        order_id: newOrder.id,
        amount: -totalAmount, // Negative for payment
        type: 'payment',
        status: 'completed',
        description: `Payment for ${selectedService.name}`,
      });
      console.log("handleCreateOrder: Payment transaction created.");

      toast({
        title: "Success",
        description: "Order placed and payment processed successfully!",
      });
      setIsOrderModalOpen(false);
      setSelectedService(null);
      router.push('/user/my-orders'); // Redirect to my orders page
    } catch (err: unknown) {
      console.error("handleCreateOrder: Error during order/payment process:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to place order or process payment.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading services: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Available Services</h1>
      <p className="text-gray-600">Browse our service offerings and place your orders.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <div key={service.id} className="relative">
            <ServiceCard service={service} onEdit={() => {}} onDelete={() => {}} />
            <Button
              className="absolute bottom-4 right-4"
              onClick={() => handleOrderService(service)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Now
            </Button>
          </div>
        ))}
      </div>

      {/* Order Service Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Service: {selectedService?.name}</DialogTitle>
            <DialogDescription>Fill in the details to place your order.</DialogDescription>
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