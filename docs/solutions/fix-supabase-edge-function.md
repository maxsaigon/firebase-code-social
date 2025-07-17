# Giải pháp 1: Sửa chữa Supabase Edge Function

## Bước 1: Xóa sạch database triggers cũ

```sql
-- Xóa tất cả triggers có thể xung đột
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Xóa policies cũ nếu có
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
```

## Bước 2: Tạo Edge Function mới với error handling tốt hơn

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        persistSession: false,
      },
    }
  )

  try {
    const { type, record } = await req.json()

    if (type === 'INSERT' && record) {
      // Kiểm tra user đã tồn tại chưa
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('id')
        .eq('id', record.id)
        .single();

      if (existingUser) {
        return new Response(JSON.stringify({ message: 'User already exists' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Tạo user profile
      const { data: userProfile, error: userProfileError } = await supabaseClient
        .from('users')
        .insert({
          id: record.id,
          email: record.email,
          full_name: record.raw_user_meta_data?.full_name || null,
          avatar_url: record.raw_user_meta_data?.avatar_url || null,
          is_admin: false,
          status: 'active',
        });

      if (userProfileError) {
        console.error('Error creating user profile:', userProfileError);
        throw new Error('Failed to create user profile');
      }

      // Tạo wallet
      const { data: wallet, error: walletError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: record.id,
          balance: 0.00,
        });

      if (walletError) {
        console.error('Error creating wallet:', walletError);
        throw new Error('Failed to create wallet');
      }

      return new Response(JSON.stringify({ 
        message: 'User profile and wallet created successfully',
        user_id: record.id 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ message: 'No action taken' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
```

## Bước 3: Thêm fallback mechanism trong frontend

```typescript
// src/api/authApi.ts
export const authApi = {
  async register(userData: CreateUserData) {
    const { email, password, full_name } = userData;
    if (!password) {
      throw new Error('Password is required for registration.');
    }
    
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
    
    // Fallback: Kiểm tra và tạo profile nếu Edge Function thất bại
    if (data.user) {
      await this.ensureUserProfileExists(data.user.id, email, full_name);
    }
    
    return data;
  },

  async ensureUserProfileExists(userId: string, email: string, fullName?: string) {
    // Đợi một chút để Edge Function có thể hoàn thành
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (!profile) {
      // Tạo profile thủ công nếu Edge Function thất bại
      await supabase.from('users').insert({
        id: userId,
        email,
        full_name: fullName || null,
        is_admin: false,
        status: 'active',
      });
      
      // Tạo wallet
      await supabase.from('wallets').insert({
        user_id: userId,
        balance: 0.00,
      });
    }
  },
};
```
