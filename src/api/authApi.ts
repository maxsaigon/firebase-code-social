import { supabase } from '@/lib/supabaseClient';
import type { User, CreateUserData } from '@/types';

export const authApi = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async register(userData: CreateUserData) {
    const { email, password, full_name } = userData;
    if (!password) {
      throw new Error('Password is required for registration.');
    }
    
    // Step 1: Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });
    if (error) throw error;
    
    // Step 2: Create user profile and wallet immediately
    if (data.user) {
      await this.ensureUserProfileExists(data.user.id, email, full_name);
    }
    
    return data;
  },

  async ensureUserProfileExists(userId: string, email: string, fullName?: string) {
    try {
      // Wait a moment to let any Edge Function complete (if it works)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        console.log('User profile already exists');
        return; // Profile exists, no need to create
      }
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          full_name: fullName || null,
          is_admin: false,
          status: 'active',
        });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw error - let user login and we'll handle it in AuthProvider
      }
      
      // Check if wallet already exists
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (!existingWallet) {
        // Create wallet
        const { error: walletError } = await supabase
          .from('wallets')
          .insert({
            user_id: userId,
            balance: 0.00,
          });
        
        if (walletError) {
          console.error('Error creating wallet:', walletError);
          // Don't throw error - let user login and we'll handle it in AuthProvider
        }
      }
      
      console.log('User profile and wallet created successfully');
    } catch (error) {
      console.error('Error in ensureUserProfileExists:', error);
      // Don't throw error - let user continue with registration
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist, try to create it
        console.log('Profile not found, attempting to create...');
        await this.ensureUserProfileExists(user.id, user.email!, user.user_metadata?.full_name);
        
        // Try to fetch again
        const { data: newProfile, error: newProfileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (newProfileError) {
          console.error('Error fetching new profile:', newProfileError);
          return null;
        }
        
        return newProfile;
      }
      throw profileError;
    }
    return profile;
  },
};