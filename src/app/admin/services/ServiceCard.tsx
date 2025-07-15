import React from 'react';
import { Package, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceCard = ({ service, onEdit, onDelete }: ServiceCardProps) => {
  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.category}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {service.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description || 'No description provided.'}</p>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">${service.price.toFixed(2)}</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(service)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(service.id)}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;