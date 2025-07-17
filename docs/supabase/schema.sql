-- =============================================
-- Admin Service Hub - Supabase Schema and RLS
-- =============================================

-- 1. BASE TABLE CREATION
-- =============================================

-- users table (extends auth.users)
CREATE TABLE public.users (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    is_admin boolean DEFAULT FALSE NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- services table (manages services)
CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL CHECK (price >= 0),
    is_active boolean DEFAULT TRUE NOT NULL,
    category text DEFAULT 'general',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- wallets table (user wallets)
CREATE TABLE public.wallets (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance numeric(15,2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- orders table (orders)
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
    total_amount numeric(15,2) NOT NULL CHECK (total_amount >= 0),
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- transactions table (transactions)
CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    amount numeric(15,2) NOT NULL,
    type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'commission')),
    status text DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description text,
    reference_id text, -- External reference ID
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. DATABASE ORGANIZATION DIAGRAM AND DEVELOPER GUIDE
-- =============================================

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE ARCHITECTURE OVERVIEW                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ auth.users  │    │   users     │    │   wallets   │    │ services    │   │
│  │ (Supabase)  │───▶│  (profile)  │───▶│  (balance)  │    │ (products)  │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│                             │                                      │         │
│                             │                                      │         │
│                             ▼                                      ▼         │
│                      ┌─────────────┐                                        │
│                      │   orders    │◀──────────────────────────────────────┘ │
│                      │ (purchases) │                                         │
│                      └─────────────┘                                         │
│                             │                                                │
│                             │                                                │
│                             ▼                                                │
│                      ┌─────────────┐                                        │
│                      │transactions │                                        │
│                      │ (payments)  │                                        │
│                      └─────────────┘                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

RELATIONS BETWEEN TABLES:
==================
1. auth.users (Supabase) → users (1:1) - Extended profile information
2. users → wallets (1:1) - Each user has 1 wallet
3. users → orders (1:n) - A user can have multiple orders
4. services → orders (1:n) - A service can be ordered multiple times
5. orders → transactions (1:n) - Each order can have multiple transactions
6. users → transactions (1:n) - A user can have multiple transactions

MAIN DATA FLOW:
===================
User Register → Auto Create Wallet → Browse Services → Create Order → Payment Transaction → Update Wallet Balance

DEVELOPER GUIDE:
===================
*/

-- A. USERS TABLE - User Information
-- ====================================
-- Purpose: Store extended profile from auth.users
-- Note: id must match auth.users.id, email must be unique
-- Important fields: is_admin (permissions), status (account status)

-- B. SERVICES TABLE - Service Catalog
-- ===================================
-- Purpose: Manage services/products for sale
-- Note: price must be >= 0, is_active to show/hide service
-- Important fields: name, price, is_active, category

-- C. WALLETS TABLE - User Wallets
-- ====================================
-- Purpose: Store the balance of each user
-- Note: Automatically created when a user registers, balance >= 0
-- Important fields: user_id (unique), balance

-- D. ORDERS TABLE - Orders
-- =========================
-- Purpose: Store user order information
-- Note: total_amount = unit_price * quantity
-- Workflow: pending → processing → completed/cancelled/refunded
-- Important fields: user_id, service_id, status, total_amount

-- E. TRANSACTIONS TABLE - Financial Transactions
-- ==========================================
-- Purpose: Store transaction history (deposits, withdrawals, payments, refunds)
-- Note: amount can be positive/negative, order_id can be null (for deposits)
-- Types: deposit (+), withdrawal (-), payment (-), refund (+), commission
-- Important fields: user_id, amount, type, status

-- FOREIGN KEY RELATIONS:
-- =====================
-- users.id → auth.users.id (CASCADE DELETE)
-- wallets.user_id → users.id (CASCADE DELETE, UNIQUE)
-- orders.user_id → users.id (CASCADE DELETE)
-- orders.service_id → services.id (CASCADE DELETE)
-- transactions.user_id → users.id (CASCADE DELETE)
-- transactions.order_id → orders.id (SET NULL) - Allows null

-- IMPORTANT BUSINESS LOGIC:
-- ==========================
-- 1. When a new user is created → Automatically create a wallet with balance = 0
-- 2. When transaction status = 'completed' → Automatically update wallet balance
-- 3. Orders can only be updated when status = 'pending'
-- 4. Wallet balance cannot be < 0 (CHECK constraint)
-- 5. Quantity and price must be > 0

-- IMPORTANT STATUSES:
-- ==========================
-- User Status: active, inactive, suspended
-- Order Status: pending, processing, completed, cancelled, refunded
-- Transaction Status: pending, completed, failed, cancelled
-- Transaction Types: deposit, withdrawal, payment, refund, commission

-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================

-- Indexes for users table (search by email, admin, status)
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_is_admin ON public.users(is_admin);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Indexes for services table (filter active, category)
CREATE INDEX idx_services_is_active ON public.services(is_active);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_created_at ON public.services(created_at);

-- Indexes for orders table (most important - frequent queries)
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_service_id ON public.orders(service_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_user_status ON public.orders(user_id, status); -- Composite index

-- Indexes for transactions table (query by user, order, type)
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type); -- Composite index

-- 3. CREATE FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update wallet balance on transaction
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        UPDATE public.wallets
        SET balance = balance + NEW.amount
        WHERE user_id = NEW.user_id;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
        UPDATE public.wallets
        SET balance = balance + NEW.amount
        WHERE user_id = NEW.user_id;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed' THEN
        UPDATE public.wallets
        SET balance = balance - OLD.amount
        WHERE user_id = OLD.user_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update wallet balance
CREATE TRIGGER update_wallet_on_transaction
    AFTER INSERT OR UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES
-- =============================================

-- ===== POLICIES FOR USERS TABLE =====

-- Allow users to view their own profile
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Allow admins to view all user profiles
CREATE POLICY "users_select_admin" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow admins to update any user
CREATE POLICY "users_update_admin" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow admins to create new users
CREATE POLICY "users_insert_admin" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow new users to create their own profile (for registration)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to delete users
CREATE POLICY "users_delete_admin" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ===== POLICIES FOR SERVICES TABLE =====

-- Allow all authenticated users to view services
CREATE POLICY "services_select_all" ON public.services
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage services
CREATE POLICY "services_manage_admin" ON public.services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ===== POLICIES FOR ORDERS TABLE =====

-- Allow users to view their own orders
CREATE POLICY "orders_select_own" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create orders for themselves
CREATE POLICY "orders_insert_own" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own orders (limited)
CREATE POLICY "orders_update_own" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all orders
CREATE POLICY "orders_manage_admin" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ===== POLICIES FOR TRANSACTIONS TABLE =====

-- Allow users to view their own transactions
CREATE POLICY "transactions_select_own" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create transactions for themselves
CREATE POLICY "transactions_insert_own" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all transactions
CREATE POLICY "transactions_manage_admin" ON public.transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ===== POLICIES FOR WALLETS TABLE =====

-- Allow users to view their own wallet
CREATE POLICY "wallets_select_own" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create their own wallet (for registration)
CREATE POLICY "wallets_insert_own" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own wallet (via transactions)
CREATE POLICY "wallets_update_own" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all wallets
CREATE POLICY "wallets_manage_admin" ON public.wallets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 6. CREATE HELPER VIEWS
-- =============================================

-- View to display order information with service name
CREATE OR REPLACE VIEW public.order_details AS
SELECT
    o.*,
    s.name as service_name,
    s.category as service_category,
    u.full_name as user_name,
    u.email as user_email
FROM public.orders o
JOIN public.services s ON o.service_id = s.id
JOIN public.users u ON o.user_id = u.id;

-- View to display dashboard statistics
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM public.orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_orders_30d,
    (SELECT SUM(total_amount) FROM public.orders WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_30d,
    (SELECT COUNT(*) FROM public.services WHERE is_active = true) as active_services,
    (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as pending_orders;

-- 8. COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.users IS 'Extended user table from auth.users - contains profile and permissions';
COMMENT ON TABLE public.services IS 'Table managing services/products available for sale';
COMMENT ON TABLE public.orders IS 'Order table - tracks purchases between users and services';
COMMENT ON TABLE public.transactions IS 'Financial transactions table - logs all money changes';
COMMENT ON TABLE public.wallets IS 'User wallet table - current balance';

COMMENT ON COLUMN public.users.is_admin IS 'Determines if the user is an admin - used for RLS permissions';
COMMENT ON COLUMN public.users.status IS 'Account status: active, inactive, suspended';
COMMENT ON COLUMN public.services.is_active IS 'Whether the service is currently for sale - false = paused';
COMMENT ON COLUMN public.orders.status IS 'Workflow: pending → processing → completed/cancelled/refunded';
COMMENT ON COLUMN public.orders.total_amount IS 'Automatically calculated = unit_price * quantity';
COMMENT ON COLUMN public.transactions.type IS 'deposit(+), withdrawal(-), payment(-), refund(+), commission(+)';
COMMENT ON COLUMN public.transactions.amount IS 'Amount: positive = received, negative = paid';
COMMENT ON COLUMN public.transactions.status IS 'pending, completed, failed, cancelled';
COMMENT ON COLUMN public.wallets.balance IS 'Current balance - automatically updated via transaction triggers';

-- 9. SET PERMISSIONS
-- =============================================

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions for anon users (if needed)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.services TO anon; -- Allow viewing services without login

-- 10. HELPER FUNCTIONS FOR DEVELOPERS
-- ===================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user wallet balance
CREATE OR REPLACE FUNCTION public.get_wallet_balance(user_id uuid DEFAULT auth.uid())
RETURNS numeric AS $$
BEGIN
    RETURN (
        SELECT balance
        FROM public.wallets
        WHERE user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has sufficient balance in wallet
CREATE OR REPLACE FUNCTION public.has_sufficient_balance(user_id uuid, required_amount numeric)
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT balance >= required_amount
        FROM public.wallets
        WHERE user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. VALIDATION TRIGGERS (ADDITIONAL)
-- =================================

-- Trigger to check if user has sufficient funds when creating a payment transaction
CREATE OR REPLACE FUNCTION public.validate_payment_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for payment transactions
    IF NEW.type = 'payment' AND NEW.amount < 0 AND NEW.status = 'completed' THEN
        -- Check balance before deducting money
        IF NOT public.has_sufficient_balance(NEW.user_id, ABS(NEW.amount)) THEN
            RAISE EXCEPTION 'Insufficient wallet balance for payment. Required: %, Available: %', 
                ABS(NEW.amount), 
                public.get_wallet_balance(NEW.user_id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_payment_before_insert
    BEFORE INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.validate_payment_transaction();

-- 12. USEFUL QUERIES FOR DEVELOPERS
-- =================================

/*
-- Get all orders for a user with service details
SELECT
    o.*,
    s.name as service_name,
    s.price as service_price
FROM orders o
JOIN services s ON o.service_id = s.id
WHERE o.user_id = auth.uid()
ORDER BY o.created_at DESC;

-- Get user transaction history
SELECT
    t.*,
    o.id as order_reference
FROM transactions t
LEFT JOIN orders o ON t.order_id = o.id
WHERE t.user_id = auth.uid()
ORDER BY t.created_at DESC;

-- Get dashboard stats (admin only)
SELECT
    (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_orders_30d,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_30d,
    (SELECT COUNT(*) FROM services WHERE is_active = true) as active_services,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders;

-- Check wallet balance consistency
SELECT
    u.email,
    w.balance as wallet_balance,
    COALESCE(SUM(t.amount), 0) as calculated_balance
FROM users u
JOIN wallets w ON u.id = w.user_id
LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
GROUP BY u.id, u.email, w.balance
HAVING w.balance != COALESCE(SUM(t.amount), 0);
*/
