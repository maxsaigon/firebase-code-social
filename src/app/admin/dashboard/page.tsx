'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import DashboardCard from '@/components/shared/DashboardCard';
import RecentOrders from '@/components/shared/RecentOrders';
import RecentUsers from '@/components/shared/RecentUsers';
import { Users, Package, Clock, DollarSign } from 'lucide-react';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dashboard_stats').select('*').single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading dashboard data: {error.message}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your service hub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="New Users"
          value={stats?.new_users_30d || 0}
          icon={Users}
          trend={{ value: 12, isPositive: true }} // Placeholder trend
        />
        <DashboardCard
          title="Active Services"
          value={stats?.active_services || 0}
          icon={Package}
        />
        <DashboardCard
          title="Pending Orders"
          value={stats?.pending_orders || 0}
          icon={Clock}
        />
        <DashboardCard
          title="Revenue (30d)"
          value={`$${stats?.revenue_30d?.toFixed(2) || 0}`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }} // Placeholder trend
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <RecentUsers />
      </div>
    </div>
  );
}