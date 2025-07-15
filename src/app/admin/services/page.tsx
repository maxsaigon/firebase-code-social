'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ServiceCard from '@/app/admin/services/ServiceCard';
import { ServiceForm } from '@/components/ServiceForm';
import { CreateServiceData, Service as ServiceType } from '@/types';

export default function ServiceManagementPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  const { data: services, isLoading, error } = useServices();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  const handleCreateService = async (data: CreateServiceData) => {
    await createServiceMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleEditService = (service: ServiceType) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleUpdateService = async (data: CreateServiceData) => {
    if (selectedService) {
      await updateServiceMutation.mutateAsync({ id: selectedService.id, updates: data });
      setIsEditModalOpen(false);
      setSelectedService(null);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      await deleteServiceMutation.mutateAsync(serviceId);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading services: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
          />
        ))}
      </div>

      {/* Create Service Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
            <DialogDescription>Fill in the details to create a new service offering.</DialogDescription>
          </DialogHeader>
          <ServiceForm onSubmit={handleCreateService} isSubmitting={createServiceMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Service Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the service details.</DialogDescription>
          </DialogHeader>
          {selectedService && (
            <ServiceForm
              service={selectedService}
              onSubmit={handleUpdateService}
              isSubmitting={updateServiceMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}