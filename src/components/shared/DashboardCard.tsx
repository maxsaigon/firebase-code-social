import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardCard = ({ title, value, icon: Icon, trend }: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={cn(
            "text-sm font-medium",
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-gray-500 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;