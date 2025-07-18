import type { Order, CreateOrderData } from '@/types';

export const orderApi = {
  async getOrders(filters?: { search?: string; status?: string; userId?: string }): Promise<Order[]> {
    const searchParams = new URLSearchParams();
    
    if (filters?.userId) {
      searchParams.append('userId', filters.userId);
    }
    if (filters?.search) {
      searchParams.append('search', filters.search);
    }
    if (filters?.status && filters.status !== 'all') {
      searchParams.append('status', filters.status);
    }

    const response = await fetch(`/api/orders?${searchParams.toString()}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch orders');
    }
    
    return result.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await fetch(`/api/orders/${id}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch order');
    }
    
    return result.data;
  },

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create order');
    }
    
    return result.data;
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update order');
    }
    
    return result.data;
  },

  async deleteOrder(id: string): Promise<void> {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete order');
    }
  },
};