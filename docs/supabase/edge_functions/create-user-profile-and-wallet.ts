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

  const { type, record } = await req.json()

  if (type === 'INSERT' && record) {
    try {
      // Insert into public.users
      const { data: userProfile, error: userProfileError } = await supabaseClient
        .from('users')
        .insert({
          id: record.id,
          email: record.email,
          full_name: record.raw_user_meta_data?.full_name || null,
          avatar_url: record.raw_user_meta_data?.avatar_url || null,
          is_admin: false,
          status: 'active',
        })
        .select()
        .single();

      if (userProfileError) {
        console.error('Error creating user profile:', userProfileError);
        return new Response(JSON.stringify({ error: 'Error creating user profile' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // Insert into public.wallets
      const { data: wallet, error: walletError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: record.id,
          balance: 0.00,
        })
        .select()
        .single();

      if (walletError) {
        console.error('Error creating wallet:', walletError);
        return new Response(JSON.stringify({ error: 'Error creating wallet' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      return new Response(JSON.stringify({ message: 'User profile and wallet created successfully' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      return new Response(JSON.stringify({ error: 'Unexpected error during function execution' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ message: 'Unhandled event type' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
})