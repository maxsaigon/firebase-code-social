import type { Transaction, CreateTransactionData } from '@/types';

export const transactionApi = {
  async getTransactions(filters?: { search?: string; type?: string; status?: string; userId?: string }): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();
    
    if (filters?.userId) {
      searchParams.append('userId', filters.userId);
    }
    if (filters?.type && filters.type !== 'all') {
      searchParams.append('type', filters.type);
    }
    if (filters?.search) {
      searchParams.append('search', filters.search);
    }

    const response = await fetch(`/api/transactions?${searchParams.toString()}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch transactions');
    }
    
    return result.data;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await fetch(`/api/transactions/${id}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch transaction');
    }
    
    return result.data;
  },

  async createTransaction(transactionData: CreateTransactionData): Promise<Transaction> {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create transaction');
    }
    
    return result.data;
  },
};