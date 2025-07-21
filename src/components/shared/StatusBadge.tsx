import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  type?: 'user' | 'service' | 'order' | 'transaction';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'user' }) => {
  const getStatusVariant = (status: string, type: string) => {
    const statusUpper = status.toUpperCase();
    
    // User status colors
    if (type === 'user') {
      switch (statusUpper) {
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'INACTIVE':
          return 'bg-red-100 text-red-800 hover:bg-red-200';
        case 'SUSPENDED':
          return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      }
    }
    
    // Service status colors
    if (type === 'service') {
      switch (statusUpper) {
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'INACTIVE':
          return 'bg-red-100 text-red-800 hover:bg-red-200';
        default:
          return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      }
    }
    
    // Order status colors
    if (type === 'order') {
      switch (statusUpper) {
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
        case 'PROCESSING':
          return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case 'COMPLETED':
          return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'CANCELLED':
          return 'bg-red-100 text-red-800 hover:bg-red-200';
        case 'REFUNDED':
          return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      }
    }
    
    // Transaction status colors
    if (type === 'transaction') {
      switch (statusUpper) {
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
        case 'COMPLETED':
          return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'FAILED':
          return 'bg-red-100 text-red-800 hover:bg-red-200';
        case 'CANCELLED':
          return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        // Transaction types
        case 'DEPOSIT':
          return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'WITHDRAWAL':
          return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
        case 'PAYMENT':
          return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case 'REFUND':
          return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        case 'COMMISSION':
          return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
        default:
          return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      }
    }
    
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  return (
    <Badge 
      className={`${getStatusVariant(status, type)} border-0 font-medium`}
      variant="secondary"
    >
      {status}
    </Badge>
  );
};
