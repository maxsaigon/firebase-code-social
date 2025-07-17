-- =============================================
-- Schema Verification Tests
-- Run these after deploying schema.sql
-- =============================================

-- 1. CHECK TABLES CREATED
-- =============================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'services', 'orders', 'transactions', 'wallets')
ORDER BY table_name;

-- Expected: 5 tables (users, services, orders, transactions, wallets)

-- 2. CHECK RLS ENABLED
-- =============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'services', 'orders', 'transactions', 'wallets')
ORDER BY tablename;

-- Expected: All tables should have rowsecurity = true

-- 3. CHECK POLICIES CREATED
-- =============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Multiple policies for each table

-- 4. CHECK INDEXES CREATED
-- =============================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'services', 'orders', 'transactions', 'wallets')
ORDER BY tablename, indexname;

-- Expected: Primary keys + custom indexes

-- 5. CHECK TRIGGERS CREATED
-- =============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected: updated_at triggers + wallet balance trigger + validation trigger

-- 6. CHECK FUNCTIONS CREATED
-- =============================================
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Expected: update_updated_at_column, update_wallet_balance, validate_payment_transaction, is_admin, get_wallet_balance, has_sufficient_balance

-- 7. CHECK VIEWS CREATED
-- =============================================
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: order_details, dashboard_stats

-- 8. CHECK CONSTRAINTS
-- =============================================
SELECT 
    constraint_name,
    table_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('users', 'services', 'orders', 'transactions', 'wallets')
ORDER BY table_name, constraint_type;

-- Expected: CHECK constraints for status fields, balance >= 0, price >= 0, etc.

-- 9. TEST BASIC OPERATIONS (Admin required)
-- =============================================

-- Test service creation (as admin)
INSERT INTO public.services (name, description, price, category) 
VALUES ('Test Service', 'Test Description', 10.00, 'test');

-- Test service selection (should work for authenticated users)
SELECT * FROM public.services WHERE is_active = true;

-- Clean up test data
DELETE FROM public.services WHERE category = 'test';

-- 10. TEST HELPER FUNCTIONS
-- =============================================

-- Test admin check function
SELECT public.is_admin(auth.uid());

-- Test wallet balance function (will return null if no wallet)
SELECT public.get_wallet_balance(auth.uid());

-- Test balance check function
SELECT public.has_sufficient_balance(auth.uid(), 100.00);

-- 11. VERIFY PERMISSIONS
-- =============================================
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name IN ('users', 'services', 'orders', 'transactions', 'wallets')
    AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee, privilege_type;

-- Expected: authenticated should have all privileges, anon should have limited access

-- 12. SAMPLE DATA TEST (Optional)
-- =============================================

-- This will only work if you have an authenticated user
-- Uncomment to test after user registration

/*
-- Test user profile creation
INSERT INTO public.users (id, email, full_name, is_admin, status)
VALUES (auth.uid(), 'test@example.com', 'Test User', false, 'active');

-- Test wallet creation
INSERT INTO public.wallets (user_id, balance)
VALUES (auth.uid(), 100.00);

-- Test transaction creation
INSERT INTO public.transactions (user_id, amount, type, status, description)
VALUES (auth.uid(), 50.00, 'deposit', 'completed', 'Test deposit');

-- Verify wallet balance updated
SELECT balance FROM public.wallets WHERE user_id = auth.uid();

-- Clean up test data
DELETE FROM public.transactions WHERE user_id = auth.uid() AND description = 'Test deposit';
DELETE FROM public.wallets WHERE user_id = auth.uid();
DELETE FROM public.users WHERE id = auth.uid();
*/

-- =============================================
-- EXPECTED RESULTS SUMMARY
-- =============================================

/*
1. Tables: 5 tables created (users, services, orders, transactions, wallets)
2. RLS: All tables have rowsecurity = true
3. Policies: Multiple policies per table (select_own, insert_own, update_own, admin policies)
4. Indexes: Primary keys + performance indexes
5. Triggers: updated_at triggers + wallet balance trigger + validation trigger
6. Functions: 6 functions created
7. Views: 2 views created (order_details, dashboard_stats)
8. Constraints: CHECK constraints for status fields, balance >= 0, etc.
9. Permissions: authenticated has full access, anon has limited access
10. Helper functions: All return appropriate values
*/
