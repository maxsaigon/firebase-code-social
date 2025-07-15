import type { User, Service, Order, Transaction } from '@/types';

// Mock Data
const users: User[] = [
  { id: 'usr_1', created_at: '2023-10-26T10:00:00Z', full_name: 'Alice Johnson', email: 'alice@example.com', is_admin: true, status: 'active', avatar_url: 'https://i.pravatar.cc/150?u=alice' },
  { id: 'usr_2', created_at: '2023-10-25T11:30:00Z', full_name: 'Bob Williams', email: 'bob@example.com', is_admin: false, status: 'active', avatar_url: 'https://i.pravatar.cc/150?u=bob' },
  { id: 'usr_3', created_at: '2023-10-24T09:00:00Z', full_name: 'Charlie Brown', email: 'charlie@example.com', is_admin: false, status: 'inactive', avatar_url: 'https://i.pravatar.cc/150?u=charlie' },
  { id: 'usr_4', created_at: '2023-10-23T14:20:00Z', full_name: 'Diana Prince', email: 'diana@example.com', is_admin: false, status: 'suspended', avatar_url: 'https://i.pravatar.cc/150?u=diana' },
  { id: 'usr_5', created_at: '2023-10-22T18:00:00Z', full_name: 'Ethan Hunt', email: 'ethan@example.com', is_admin: false, status: 'active', avatar_url: 'https://i.pravatar.cc/150?u=ethan' },
];

const services: Service[] = [
  { id: 'srv_1', created_at: '2023-01-15T10:00:00Z', name: 'Graphic Design', description: 'Professional graphic design services for branding and marketing materials.', price: 150, category: 'Design', is_active: true, image_url: `https://placehold.co/600x400.png` },
  { id: 'srv_2', created_at: '2023-02-20T14:30:00Z', name: 'Web Development', description: 'Custom website development with modern technologies.', price: 1200, category: 'Tech', is_active: true, image_url: `https://placehold.co/600x400.png` },
  { id: 'srv_3', created_at: '2023-03-10T09:00:00Z', name: 'Content Writing', description: 'High-quality content for blogs, websites, and social media.', price: 80, category: 'Writing', is_active: false, image_url: `https://placehold.co/600x400.png` },
  { id: 'srv_4', created_at: '2023-04-05T18:00:00Z', name: 'SEO Optimization', description: 'Improve your search engine rankings and drive organic traffic.', price: 300, category: 'Marketing', is_active: true, image_url: `https://placehold.co/600x400.png` },
];

const orders: Order[] = [
  { id: 'ord_1', created_at: '2023-10-26T12:00:00Z', user_id: 'usr_2', service_id: 'srv_1', quantity: 1, unit_price: 150, total_amount: 150, status: 'completed' },
  { id: 'ord_2', created_at: '2023-10-25T15:00:00Z', user_id: 'usr_3', service_id: 'srv_2', quantity: 1, unit_price: 1200, total_amount: 1200, status: 'processing' },
  { id: 'ord_3', created_at: '2023-10-24T10:00:00Z', user_id: 'usr_4', service_id: 'srv_4', quantity: 2, unit_price: 300, total_amount: 600, status: 'pending' },
  { id: 'ord_4', created_at: '2023-10-23T11:00:00Z', user_id: 'usr_5', service_id: 'srv_1', quantity: 1, unit_price: 150, total_amount: 150, status: 'cancelled' },
];

const transactions: Transaction[] = [
  { id: 'txn_1', created_at: '2023-10-26T12:05:00Z', user_id: 'usr_2', order_id: 'ord_1', amount: -150, type: 'payment', status: 'completed' },
  { id: 'txn_2', created_at: '2023-10-25T15:10:00Z', user_id: 'usr_3', order_id: 'ord_2', amount: -1200, type: 'payment', status: 'pending' },
  { id: 'txn_3', created_at: '2023-10-20T09:00:00Z', user_id: 'usr_2', order_id: null, amount: 500, type: 'deposit', status: 'completed' },
  { id: 'txn_4', created_at: '2023-10-23T11:05:00Z', user_id: 'usr_5', order_id: 'ord_4', amount: 0, type: 'payment', status: 'failed' },
];

// Mock API Functions
export const getUsers = async () => Promise.resolve(users);
export const getServices = async () => Promise.resolve(services);
export const getOrders = async () => {
  return Promise.resolve(orders.map(order => ({
    ...order,
    user: users.find(u => u.id === order.user_id),
    service: services.find(s => s.id === order.service_id),
  })));
};
export const getTransactions = async () => {
  return Promise.resolve(transactions.map(tx => ({
    ...tx,
    user: users.find(u => u.id === tx.user_id),
  })));
};

export const getDashboardStats = async () => {
  return Promise.resolve({
    newUsers30d: 12,
    activeServices: services.filter(s => s.is_active).length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    revenue30d: 1850,
  });
};

export const getRecentOrders = async () => {
  const recent = await getOrders();
  return Promise.resolve(recent.slice(0, 5));
};

export const getPopularServices = async () => {
  return Promise.resolve(services.slice(0, 2));
};

export const getRecentUsers = async () => {
  const allUsers = await getUsers();
  const sorted = allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return Promise.resolve(sorted.slice(0, 5));
};
