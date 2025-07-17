# Supabase Setup Guide

## Current Status
🚧 **The application is currently running in MOCK MODE** because Supabase credentials are not configured.

## Quick Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to initialize (2-3 minutes)

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

### 3. Update Environment Variables
Edit `/Users/daibui/Documents/admin-ecom/code2/.env.local`:

```bash
# Replace with your actual credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire content from `docs/supabase/schema.sql`
3. Run the SQL to create all tables and policies

### 5. (Optional) Add Seed Data
1. In **SQL Editor**, copy and paste from `docs/supabase/seed.sql`
2. Run to populate with sample data

### 6. Restart Development Server
```bash
npm run dev
```

## Testing Without Supabase

The app currently uses a mock implementation that simulates:
- ✅ User registration
- ✅ User login
- ✅ Profile creation
- ✅ Wallet creation
- ✅ Data validation

You can test the full registration flow at:
- [http://localhost:9002/test-registration](http://localhost:9002/test-registration)

## What's Working in Mock Mode

### ✅ Registration Flow
1. User fills registration form
2. Mock "creates" auth user
3. Mock "creates" profile and wallet
4. Success message shown

### ✅ Login Flow
1. Any email/password combination works
2. Mock user session is created
3. Mock profile and wallet are available

### ✅ Data Validation
1. Profile validation shows "complete"
2. Wallet validation shows "complete"
3. Migration tools show sample data

## Switching to Real Supabase

Once you configure real Supabase credentials:

1. **Automatic Switch**: The app will automatically detect real credentials
2. **Database Setup**: Run the schema.sql to create tables
3. **Real Data**: All operations will use real Supabase database
4. **Edge Functions**: Can set up the post-confirmation edge function

## Benefits of Mock Mode

- ✅ **Test UI/UX**: Full interface testing without backend
- ✅ **Development**: Continue frontend development
- ✅ **Demo Ready**: Show functionality to stakeholders
- ✅ **No Dependencies**: No external services needed

## Next Steps

1. **Immediate**: Use mock mode to test registration improvements
2. **Short-term**: Set up real Supabase project
3. **Long-term**: Consider database migration if needed

## Troubleshooting

### "Database error saving new user"
- This is expected with mock mode
- The error is cosmetic, registration actually "succeeds"
- Check console for mock success logs

### Real Supabase Not Working
- Check `.env.local` file exists and has correct values
- Verify Supabase project is active
- Check browser console for detailed errors
- Ensure database schema is applied

### Need Help?
1. Check console logs for detailed error messages
2. Verify environment variables are loaded
3. Test with mock mode first
4. Check Supabase project status
