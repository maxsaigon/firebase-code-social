import { supabase } from '@/lib/supabaseClient';
import type { Wallet, Transaction } from '@/types';

export const addFundApi = {
  async getWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      throw error;
    }
    return data;
  },

  async addFunds(userId: string, amount: number, description: string = 'Manual deposit'): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount: amount,
          type: 'deposit',
          status: 'completed',
          description: description,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async withdrawFunds(userId: string, amount: number, description: string = 'Manual withdrawal'): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount: -amount, // Negative amount for withdrawal
          type: 'withdrawal',
          status: 'completed',
          description: description,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};