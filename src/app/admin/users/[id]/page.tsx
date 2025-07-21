'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  CreditCard, 
  ShoppingBag,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userApi } from '@/api/userApi';

interface UserDetail {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  total_spent: number;
  wallet_balance: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  service: {
    name: string;
    description?: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  status: string;
  description?: string;
  created_at: string;
}

const UserDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // Fetch user details
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json() as UserDetail;
    },
  });

  // Fetch user statistics
  const { data: stats } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch user stats');
      return response.json() as UserStats;
    },
  });

  // Fetch user orders
  const { data: orders } = useQuery({
    queryKey: ['user-orders', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/orders`);
      if (!response.ok) throw new Error('Failed to fetch user orders');
      return response.json() as Order[];
    },
  });

  // Fetch user transactions
  const { data: transactions } = useQuery({
    queryKey: ['user-transactions', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch user transactions');
      return response.json() as Transaction[];
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      INACTIVE: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      SUSPENDED: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800', 
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const getTransactionTypeBadge = (type: string) => {
    const colors = {
      DEPOSIT: 'bg-green-100 text-green-800',
      PAYMENT: 'bg-red-100 text-red-800',
      REFUND: 'bg-blue-100 text-blue-800',
      WITHDRAWAL: 'bg-orange-100 text-orange-800',
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">User Not Found</h2>
        <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.full_name || 'Unnamed User'}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <StatusBadge status={user.status} type="user" />
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_spent?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.wallet_balance?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completed_orders || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <Badge variant={user.is_admin ? "default" : "secondary"}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{format(new Date(user.created_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{format(new Date(user.updated_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Orders and Transactions */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders History</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{order.service.name}</h4>
                        <p className="text-sm text-gray-600">{order.service.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="font-bold">${order.total_amount.toFixed(2)}</div>
                        <StatusBadge status={order.status} type="order" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={transaction.transaction_type} type="transaction" />
                          <span className="font-medium">
                            {transaction.transaction_type === 'PAYMENT' ? '-' : '+'}
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetailPage;
