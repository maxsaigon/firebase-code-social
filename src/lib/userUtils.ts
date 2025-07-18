import { supabase } from '@/lib/supabaseClient';

export const userUtils = {
  /**
   * Ensures that user profile and wallet exist for a given user ID
   * This is a utility function that can be called from anywhere
   */
  async ensureUserDataExists(userId: string, _email: string, _fullName?: string) {
    try {
            // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
        throw new Error('Failed to check existing profile');
      }
      
      if (existingProfile) {
        console.log('User profile already exists');
        return { success: true, message: 'Profile already exists' };
      }
      
      // Check if wallet already exists
      const { data: existingWallet, error: walletCheckError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (walletCheckError && walletCheckError.code !== 'PGRST116') {
        console.error('Error checking existing wallet:', walletCheckError);
        throw new Error('Failed to check existing wallet');
      }
      
      if (!existingWallet) {
        console.log('Creating missing wallet...');
        const { error: walletError } = await supabase
          .from('wallets')
          .insert({
            user_id: userId,
            balance: 0.00,
          });
        
        if (walletError) {
          console.error('Error creating wallet:', walletError);
          throw new Error('Failed to create wallet');
        }
      }
      
      return { success: true, message: 'User data ensured successfully' };
    } catch (error) {
      console.error('Error in ensureUserDataExists:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  /**
   * Validates that user has all required data (profile + wallet)
   */
  async validateUserData(userId: string) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      return {
        hasProfile: !!profile,
        hasWallet: !!wallet,
        isComplete: !!profile && !!wallet
      };
    } catch (error) {
      console.error('Error validating user data:', error);
      return {
        hasProfile: false,
        hasWallet: false,
        isComplete: false
      };
    }
  },

  /**
   * Repairs missing user data if detected
   */
  async repairUserData(userId: string, email: string, fullName?: string) {
    const validation = await this.validateUserData(userId);
    
    if (!validation.isComplete) {
      console.log('Repairing incomplete user data...');
      return await this.ensureUserDataExists(userId, email, fullName);
    }
    
    return { success: true, message: 'User data is complete' };
  }
};
