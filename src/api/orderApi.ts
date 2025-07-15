import { supabase } from '@/lib/supabaseClient';
import type { Order, CreateOrderData } from '@/types';

export const orderApi = {
  async getOrders(filters?: { search?: string; status?: string }): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select('*');

    if (filters?.search) {
      query = query.or(`id.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};