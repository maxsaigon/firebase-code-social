export type User = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
};

export type Service = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
  image_url?: string;
};

export type Order = {
  id: string;
  created_at: string;
  user_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  user?: User;
  service?: Service;
};

export type Transaction = {
  id: string;
  created_at: string;
  user_id: string;
  order_id: string | null;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  user?: User;
  order?: Order;
};
