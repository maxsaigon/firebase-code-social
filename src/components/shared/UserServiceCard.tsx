import React from 'react';
import { Package } from 'lucide-react';
import { Service } from '@/types';

interface UserServiceCardProps {
  service: Service;
}

const UserServiceCard = ({ service }: UserServiceCardProps) => {
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
          {service.is_active ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description || 'No description provided.'}</p>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">${service.price.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default UserServiceCard;
