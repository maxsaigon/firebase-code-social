/**
 * Migration script to fix existing users who may have incomplete data
 * This can be run as a one-time fix or integrated into admin panel
 */

import { supabase } from '@/lib/supabaseClient';
import { userUtils } from '@/lib/userUtils';

interface MigrationResult {
  success: boolean;
  usersProcessed: number;
  usersFixed: number;
  errors: string[];
}

export const userMigration = {
  /**
   * Fix all users who have auth but missing profile or wallet
   */
  async fixAllUsers(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      usersProcessed: 0,
      usersFixed: 0,
      errors: []
    };

    try {
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        result.errors.push(`Failed to get auth users: ${authError.message}`);
        return result;
      }

      console.log(`Found ${authUsers.users.length} auth users`);

      for (const authUser of authUsers.users) {
        result.usersProcessed++;
        
        try {
          const validation = await userUtils.validateUserData(authUser.id);
          
          if (!validation.isComplete) {
            console.log(`Fixing user ${authUser.email}...`);
            
            const repairResult = await userUtils.ensureUserDataExists(
              authUser.id,
              authUser.email!,
              authUser.user_metadata?.full_name
            );
            
            if (repairResult.success) {
              result.usersFixed++;
              console.log(`✓ Fixed user ${authUser.email}`);
            } else {
              result.errors.push(`Failed to fix user ${authUser.email}: ${repairResult.error}`);
            }
          } else {
            console.log(`✓ User ${authUser.email} data is complete`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Error processing user ${authUser.email}: ${errorMessage}`);
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Migration failed: ${errorMessage}`);
      return result;
    }
  },

  /**
   * Generate a report of users with incomplete data
   */
  async generateReport() {
    const report = {
      totalAuthUsers: 0,
      usersWithoutProfile: 0,
      usersWithoutWallet: 0,
      completeUsers: 0,
      incompleteUsers: [] as Array<{
        id: string;
        email: string | undefined;
        hasProfile: boolean;
        hasWallet: boolean;
      }>
    };

    try {
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        throw new Error(`Failed to get auth users: ${authError.message}`);
      }

      report.totalAuthUsers = authUsers.users.length;

      for (const authUser of authUsers.users) {
        const validation = await userUtils.validateUserData(authUser.id);
        
        if (!validation.hasProfile) {
          report.usersWithoutProfile++;
        }
        
        if (!validation.hasWallet) {
          report.usersWithoutWallet++;
        }
        
        if (validation.isComplete) {
          report.completeUsers++;
        } else {
          report.incompleteUsers.push({
            id: authUser.id,
            email: authUser.email,
            hasProfile: validation.hasProfile,
            hasWallet: validation.hasWallet
          });
        }
      }

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  /**
   * Fix a specific user by ID
   */
  async fixUser(userId: string) {
    try {
      // Get user from auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      if (authError) {
        throw new Error(`Failed to get auth user: ${authError.message}`);
      }

      if (!authUser.user) {
        throw new Error('User not found in auth');
      }

      const result = await userUtils.ensureUserDataExists(
        authUser.user.id,
        authUser.user.email!,
        authUser.user.user_metadata?.full_name
      );

      return result;
    } catch (error) {
      console.error('Error fixing user:', error);
      throw error;
    }
  }
};
