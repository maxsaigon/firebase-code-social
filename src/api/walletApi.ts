export const walletApi = {
  async getWallet(userId: string) {
    const response = await fetch(`/api/wallet?userId=${userId}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch wallet');
    }
    
    return result.data;
  },

  async addFunds(userId: string, amount: number, description?: string) {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        amount,
        description
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to add funds');
    }
    
    return result.data;
  },
};
