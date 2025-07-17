# Giải pháp 3: Frontend-handled Registration

## Bước 1: Xử lý registration hoàn toàn ở frontend

```typescript
// src/api/authApi.ts
export const authApi = {
  async register(userData: CreateUserData) {
    const { email, password, full_name } = userData;
    if (!password) {
      throw new Error('Password is required for registration.');
    }
    
    // Tạo user trong auth.users
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
    
    // Nếu user được tạo thành công
    if (data.user) {
      // Tạo profile ngay lập tức
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: full_name || null,
          is_admin: false,
          status: 'active',
        });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Không throw error, để user có thể login và tạo profile sau
      }
      
      // Tạo wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: data.user.id,
          balance: 0.00,
        });
      
      if (walletError) {
        console.error('Error creating wallet:', walletError);
        // Không throw error, để user có thể login và tạo wallet sau
      }
    }
    
    return data;
  },
};
```

## Bước 2: Thêm profile check trong AuthProvider

```typescript
// src/contexts/AuthProvider.tsx
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ... existing code ...

  const ensureUserProfile = async (user: any) => {
    // Kiểm tra profile tồn tại
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile không tồn tại, tạo mới
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          is_admin: false,
          status: 'active',
        });
      
      if (createError) {
        console.error('Error creating user profile:', createError);
        return null;
      }
      
      // Tạo wallet nếu chưa có
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0.00,
        });
      
      if (walletError) {
        console.error('Error creating wallet:', walletError);
      }
      
      // Fetch profile mới tạo
      const { data: newProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return newProfile;
    }
    
    return profile;
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      setSession(session);
      if (session) {
        const profile = await ensureUserProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          const profile = await ensureUserProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ... rest of the code ...
};
```

## Ưu điểm:
- Kiểm soát hoàn toàn flow registration
- Dễ debug và maintenance
- Không phụ thuộc vào Edge Functions hay Database Triggers

## Nhược điểm:
- Có thể có race conditions
- Cần handle các trường hợp edge cases
