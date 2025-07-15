import { supabase } from '@/lib/supabaseClient';
import type { Transaction, CreateTransactionData } from '@/types';

export const transactionApi = {
  async getTransactions(filters?: { search?: string; type?: string; status?: string }): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*');

    if (filters?.search) {
      query = query.or(`description.ilike.%${filters.search}%,reference_id.ilike.%${filters.search}%`);
    }
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createTransaction(transactionData: CreateTransactionData): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};