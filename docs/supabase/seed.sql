-- =============================================
-- Admin Service Hub - Supabase Sample Data
-- =============================================

-- 1. INSERT USERS (after auth.users are created)
INSERT INTO public.users (id, email, full_name, is_admin, status, created_at) VALUES
-- Admin user
('5e6c742e-2d13-4fb7-940c-4a05ed755ec0', 'admin@demo.com', 'System Administrator', true, 'active', '2024-01-01 10:00:00+00'),
-- Regular users
('64e4638e-0f83-4a07-83ff-becbf9d4bc00', 'john.doe@gmail.com', 'John Doe', false, 'active', '2024-01-05 11:30:00+00'),
('d9b74981-785c-43c0-b432-1fa2d579d27d', 'jane.smith@gmail.com', 'Jane Smith', false, 'active', '2024-01-10 14:00:00+00'),
('262e2433-b9dc-4303-8ed4-aac304e9260e', 'mike.wilson@gmail.com', 'Mike Wilson', false, 'inactive', '2024-01-15 09:00:00+00');

-- 2. INSERT SERVICES
INSERT INTO public.services (id, name, description, price, is_active, category, created_at) VALUES
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Social Media Boost', 'Increase your social media followers and engagement', 9.99, true, 'social-media', '2024-01-02 09:00:00+00'),
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Website Traffic Package', 'Drive targeted traffic to your website', 29.99, true, 'traffic', '2024-01-03 10:00:00+00'),
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'SEO Optimization', 'Improve your website search engine ranking', 79.99, true, 'seo', '2024-01-04 11:00:00+00'),
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Content Writing', 'Professional content writing services', 49.99, true, 'content', '2024-01-06 13:00:00+00'),
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Logo Design', 'Custom logo design for your brand', 99.99, false, 'design', '2024-01-07 14:00:00+00');

-- 3. INSERT ORDERS
INSERT INTO public.orders (id, user_id, service_id, quantity, unit_price, total_amount, status, created_at) VALUES
-- John's orders
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', '64e4638e-0f83-4a07-83ff-becbf9d4bc00', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 2, 9.99, 19.98, 'completed', '2024-01-07 10:00:00+00'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '64e4638e-0f83-4a07-83ff-becbf9d4bc00', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 1, 29.99, 29.99, 'processing', '2024-01-08 14:00:00+00'),
-- Jane's orders
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'd9b74981-785c-43c0-b432-1fa2d579d27d', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 1, 79.99, 79.99, 'completed', '2024-01-12 09:00:00+00'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'd9b74981-785c-43c0-b432-1fa2d579d27d', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 2, 49.99, 99.98, 'cancelled', '2024-01-15 11:00:00+00'),
-- Mike's orders
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '262e2433-b9dc-4303-8ed4-aac304e9260e', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 1, 9.99, 9.99, 'pending', '2024-01-18 16:00:00+00');

-- 4. INSERT TRANSACTIONS (will automatically update wallet balance)
INSERT INTO public.transactions (id, user_id, order_id, amount, type, status, description, created_at) VALUES
-- John's transactions
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', '64e4638e-0f83-4a07-83ff-becbf9d4bc00', NULL, 100.00, 'deposit', 'completed', 'Wallet top-up via PayPal', '2024-01-06 10:00:00+00'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', '64e4638e-0f83-4a07-83ff-becbf9d4bc00', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', -19.98, 'payment', 'completed', 'Payment for Social Media Boost x2', '2024-01-07 10:01:00+00'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', '64e4638e-0f83-4a07-83ff-becbf9d4bc00', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', -29.99, 'payment', 'completed', 'Payment for Website Traffic Package', '2024-01-08 14:01:00+00'),

-- Jane's transactions
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'd9b74981-785c-43c0-b432-1fa2d579d27d', NULL, 200.00, 'deposit', 'completed', 'Wallet top-up via Credit Card', '2024-01-11 11:00:00+00'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'd9b74981-785c-43c0-b432-1fa2d579d27d', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', -79.99, 'payment', 'completed', 'Payment for SEO Optimization', '2024-01-12 09:01:00+00'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c06', 'd9b74981-785c-43c0-b432-1fa2d579d27d', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 99.98, 'refund', 'completed', 'Refund for cancelled Content Writing order', '2024-01-15 11:15:00+00'),

-- Mike's transactions
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c07', '262e2433-b9dc-4303-8ed4-aac304e9260e', NULL, 50.00, 'deposit', 'completed', 'Wallet top-up via Bank Transfer', '2024-01-17 15:00:00+00');

-- 5. CHECK WALLET BALANCE RESULTS (after inserting transactions)
/*
Expected wallet balances:
- John (64e4638e...): 100.00 - 19.98 - 29.99 = 50.03
- Jane (d9b74981...): 200.00 - 79.99 + 99.98 = 219.99
- Mike (262e2433...): 50.00 = 50.00
*/

-- DATA VERIFICATION QUERIES
-- ======================

-- Check wallet balance
SELECT
    u.full_name,
    u.email,
    w.balance,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
    (SELECT COUNT(*) FROM transactions WHERE user_id = u.id) as total_transactions
FROM users u
JOIN wallets w ON u.id = w.user_id
ORDER BY u.created_at;

-- Check order details
SELECT
    o.id,
    u.full_name as customer,
    s.name as service,
    o.quantity,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN services s ON o.service_id = s.id
ORDER BY o.created_at;

-- Check transaction history
SELECT
    t.id,
    u.full_name as user,
    t.amount,
    t.type,
    t.status,
    t.description,
    t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at;

-- USEFUL QUERIES FOR DEVELOPERS
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