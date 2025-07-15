export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password?: string;
  full_name?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  category?: string;
}

export interface Order {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  user_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  order_id?: string | null;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  reference_id?: string;
  created_at: string;
}

export interface CreateTransactionData {
  user_id: string;
  order_id?: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  reference_id?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  new_users_30d: number;
  new_orders_30d: number;
  revenue_30d: number;
  active_services: number;
  pending_orders: number;
}