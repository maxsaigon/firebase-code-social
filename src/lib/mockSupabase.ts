// Mock implementation for testing when Supabase is not available
export const mockSupabase = {
  auth: {
    signUp: async ({ email, password, options }: any) => {
      // Simulate successful signup
      const user = {
        id: `user_${Date.now()}`,
        email,
        user_metadata: options?.data || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return {
        data: {
          user,
          session: {
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            expires_in: 3600,
            token_type: 'bearer',
            user,
          },
        },
        error: null,
      };
    },
    
    signInWithPassword: async ({ email, password }: any) => {
      const user = {
        id: `user_${Date.now()}`,
        email,
        user_metadata: { full_name: 'Test User' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return {
        data: {
          user,
          session: {
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            expires_in: 3600,
            token_type: 'bearer',
            user,
          },
        },
        error: null,
      };
    },
    
    signOut: async () => {
      return { error: null };
    },
    
    getUser: async () => {
      return {
        data: {
          user: {
            id: 'mock_user_id',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
        },
        error: null,
      };
    },
    
    getSession: async () => {
      return {
        data: {
          session: {
            user: {
              id: 'mock_user_id',
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' },
            },
          },
        },
        error: null,
      };
    },
    
    onAuthStateChange: (callback: any) => {
      // Mock subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
    
    admin: {
      listUsers: async () => {
        return {
          data: {
            users: [
              {
                id: 'user_1',
                email: 'user1@example.com',
                user_metadata: { full_name: 'User One' },
              },
              {
                id: 'user_2',
                email: 'user2@example.com',
                user_metadata: { full_name: 'User Two' },
              },
            ],
          },
          error: null,
        };
      },
      
      getUserById: async (id: string) => {
        return {
          data: {
            user: {
              id,
              email: 'test@example.com',
              user_metadata: { full_name: 'Test User' },
            },
          },
          error: null,
        };
      },
    },
  },
  
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'users') {
            return {
              data: {
                id: value,
                email: 'test@example.com',
                full_name: 'Test User',
                is_admin: false,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            };
          }
          if (table === 'wallets') {
            return {
              data: {
                id: `wallet_${Date.now()}`,
                user_id: value,
                balance: 0.00,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            };
          }
          return { data: null, error: { code: 'PGRST116' } };
        },
      }),
    }),
    
    insert: (data: any) => {
      const insertPromise = Promise.resolve({
        data: {
          id: `${table}_${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });
      
      return Object.assign(insertPromise, {
        select: () => ({
          single: () => insertPromise,
        }),
      });
    },
  }),
};
