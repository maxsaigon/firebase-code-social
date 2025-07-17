-- =============================================
-- Admin Service Hub - PostgreSQL Sample Data
-- =============================================

-- 1. INSERT USERS (with hashed passwords)
-- All passwords are 'password123'
INSERT INTO users (id, email, full_name, password, is_admin, status, created_at, updated_at) VALUES
-- Admin user
(gen_random_uuid(), 'admin@demo.com', 'System Administrator', '$2b$12$LQv3c1yqBwlVHpPjrCpCQu3/5ejzSUIMHX/HCDz8nw.CzVS.9W7Cy', true, 'ACTIVE', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),

-- Regular users
(gen_random_uuid(), 'john.doe@gmail.com', 'John Doe', '$2b$12$LQv3c1yqBwlVHpPjrCpCQu3/5ejzSUIMHX/HCDz8nw.CzVS.9W7Cy', false, 'ACTIVE', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),

(gen_random_uuid(), 'jane.smith@gmail.com', 'Jane Smith', '$2b$12$LQv3c1yqBwlVHpPjrCpCQu3/5ejzSUIMHX/HCDz8nw.CzVS.9W7Cy', false, 'ACTIVE', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

(gen_random_uuid(), 'mike.wilson@gmail.com', 'Mike Wilson', '$2b$12$LQv3c1yqBwlVHpPjrCpCQu3/5ejzSUIMHX/HCDz8nw.CzVS.9W7Cy', false, 'INACTIVE', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),

(gen_random_uuid(), 'sarah.johnson@outlook.com', 'Sarah Johnson', '$2b$12$LQv3c1yqBwlVHpPjrCpCQu3/5ejzSUIMHX/HCDz8nw.CzVS.9W7Cy', false, 'ACTIVE', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

(gen_random_uuid(), 'david.brown@yahoo.com', 'David Brown', '$2b$12$LQv3c1yqBwlVHpPjrCpCQu3/5ejzSUIMHX/HCDz8nw.CzVS.9W7Cy', false, 'ACTIVE', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- 2. CREATE WALLETS for all users (using variables for better readability)
DO $$
DECLARE
    admin_user_id UUID;
    john_user_id UUID;
    jane_user_id UUID;
    mike_user_id UUID;
    sarah_user_id UUID;
    david_user_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@demo.com';
    SELECT id INTO john_user_id FROM users WHERE email = 'john.doe@gmail.com';
    SELECT id INTO jane_user_id FROM users WHERE email = 'jane.smith@gmail.com';
    SELECT id INTO mike_user_id FROM users WHERE email = 'mike.wilson@gmail.com';
    SELECT id INTO sarah_user_id FROM users WHERE email = 'sarah.johnson@outlook.com';
    SELECT id INTO david_user_id FROM users WHERE email = 'david.brown@yahoo.com';

    -- Insert wallets
    INSERT INTO wallets (id, user_id, balance, created_at, updated_at) VALUES
    (gen_random_uuid(), admin_user_id, 1000.00, NOW() - INTERVAL '30 days', NOW()),
    (gen_random_uuid(), john_user_id, 150.50, NOW() - INTERVAL '25 days', NOW()),
    (gen_random_uuid(), jane_user_id, 275.25, NOW() - INTERVAL '20 days', NOW()),
    (gen_random_uuid(), mike_user_id, 50.00, NOW() - INTERVAL '15 days', NOW()),
    (gen_random_uuid(), sarah_user_id, 89.99, NOW() - INTERVAL '10 days', NOW()),
    (gen_random_uuid(), david_user_id, 200.00, NOW() - INTERVAL '5 days', NOW());
END $$;

-- 3. INSERT SERVICES
INSERT INTO services (id, name, description, price, is_active, category, created_at, updated_at) VALUES
-- Social Media Services
(gen_random_uuid(), 'Instagram Followers Boost', 'Get 1000+ high-quality Instagram followers to boost your social presence', 19.99, true, 'social-media', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),

(gen_random_uuid(), 'TikTok Views Package', 'Increase your TikTok video views and engagement rate', 14.99, true, 'social-media', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),

(gen_random_uuid(), 'YouTube Subscribers', 'Grow your YouTube channel with real subscribers', 39.99, true, 'social-media', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),

-- Digital Marketing Services
(gen_random_uuid(), 'Website Traffic Boost', 'Drive targeted traffic to your website with our premium package', 29.99, true, 'marketing', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days'),

(gen_random_uuid(), 'SEO Optimization Package', 'Complete SEO audit and optimization for better search rankings', 79.99, true, 'marketing', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),

(gen_random_uuid(), 'Google Ads Setup', 'Professional Google Ads campaign setup and management', 149.99, true, 'marketing', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),

-- Content Services
(gen_random_uuid(), 'Professional Logo Design', 'Custom logo design with unlimited revisions', 99.99, true, 'design', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),

(gen_random_uuid(), 'Content Writing Service', 'High-quality articles and blog posts for your business', 49.99, true, 'content', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),

(gen_random_uuid(), 'Video Editing Service', 'Professional video editing for social media and marketing', 89.99, true, 'content', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),

-- Development Services
(gen_random_uuid(), 'Landing Page Creation', 'Responsive landing page design and development', 199.99, true, 'development', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

(gen_random_uuid(), 'Mobile App Consultation', 'Expert consultation for mobile app development strategy', 299.99, false, 'development', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),

(gen_random_uuid(), 'WordPress Setup', 'Complete WordPress website setup with theme customization', 159.99, true, 'development', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days');

-- 4. INSERT ORDERS WITH REALISTIC DATA
DO $$
DECLARE
    john_user_id UUID;
    jane_user_id UUID;
    sarah_user_id UUID;
    david_user_id UUID;
    
    instagram_service_id UUID;
    tiktok_service_id UUID;
    traffic_service_id UUID;
    seo_service_id UUID;
    logo_service_id UUID;
    content_service_id UUID;
    landing_service_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO john_user_id FROM users WHERE email = 'john.doe@gmail.com';
    SELECT id INTO jane_user_id FROM users WHERE email = 'jane.smith@gmail.com';
    SELECT id INTO sarah_user_id FROM users WHERE email = 'sarah.johnson@outlook.com';
    SELECT id INTO david_user_id FROM users WHERE email = 'david.brown@yahoo.com';
    
    -- Get service IDs
    SELECT id INTO instagram_service_id FROM services WHERE name = 'Instagram Followers Boost';
    SELECT id INTO tiktok_service_id FROM services WHERE name = 'TikTok Views Package';
    SELECT id INTO traffic_service_id FROM services WHERE name = 'Website Traffic Boost';
    SELECT id INTO seo_service_id FROM services WHERE name = 'SEO Optimization Package';
    SELECT id INTO logo_service_id FROM services WHERE name = 'Professional Logo Design';
    SELECT id INTO content_service_id FROM services WHERE name = 'Content Writing Service';
    SELECT id INTO landing_service_id FROM services WHERE name = 'Landing Page Creation';

    -- Insert orders
    INSERT INTO orders (id, user_id, service_id, quantity, unit_price, total_amount, status, created_at, updated_at) VALUES
    -- John's orders
    (gen_random_uuid(), john_user_id, instagram_service_id, 2, 19.99, 39.98, 'COMPLETED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), john_user_id, traffic_service_id, 1, 29.99, 29.99, 'PROCESSING', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), john_user_id, tiktok_service_id, 1, 14.99, 14.99, 'PENDING', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

    -- Jane's orders
    (gen_random_uuid(), jane_user_id, seo_service_id, 1, 79.99, 79.99, 'COMPLETED', NOW() - INTERVAL '18 days', NOW() - INTERVAL '16 days'),
    (gen_random_uuid(), jane_user_id, logo_service_id, 1, 99.99, 99.99, 'COMPLETED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), jane_user_id, content_service_id, 3, 49.99, 149.97, 'CANCELLED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'),

    -- Sarah's orders
    (gen_random_uuid(), sarah_user_id, instagram_service_id, 1, 19.99, 19.99, 'COMPLETED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days'),
    (gen_random_uuid(), sarah_user_id, content_service_id, 2, 49.99, 99.98, 'PROCESSING', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

    -- David's orders
    (gen_random_uuid(), david_user_id, landing_service_id, 1, 199.99, 199.99, 'PENDING', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), david_user_id, traffic_service_id, 2, 29.99, 59.98, 'PROCESSING', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days');
END $$;

-- 5. INSERT TRANSACTIONS (Deposits, Payments, Refunds)
DO $$
DECLARE
    admin_user_id UUID;
    john_user_id UUID;
    jane_user_id UUID;
    sarah_user_id UUID;
    david_user_id UUID;
    
    john_order1_id UUID;
    john_order2_id UUID;
    jane_order1_id UUID;
    jane_order2_id UUID;
    jane_order3_id UUID;
    sarah_order1_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@demo.com';
    SELECT id INTO john_user_id FROM users WHERE email = 'john.doe@gmail.com';
    SELECT id INTO jane_user_id FROM users WHERE email = 'jane.smith@gmail.com';
    SELECT id INTO sarah_user_id FROM users WHERE email = 'sarah.johnson@outlook.com';
    SELECT id INTO david_user_id FROM users WHERE email = 'david.brown@yahoo.com';
    
    -- Get some order IDs for transactions
    SELECT id INTO john_order1_id FROM orders WHERE user_id = john_user_id AND total_amount = 39.98;
    SELECT id INTO john_order2_id FROM orders WHERE user_id = john_user_id AND total_amount = 29.99;
    SELECT id INTO jane_order1_id FROM orders WHERE user_id = jane_user_id AND total_amount = 79.99;
    SELECT id INTO jane_order2_id FROM orders WHERE user_id = jane_user_id AND total_amount = 99.99;
    SELECT id INTO jane_order3_id FROM orders WHERE user_id = jane_user_id AND total_amount = 149.97;
    SELECT id INTO sarah_order1_id FROM orders WHERE user_id = sarah_user_id AND total_amount = 19.99;

    -- Insert transactions
    INSERT INTO transactions (id, user_id, order_id, amount, type, status, description, created_at, updated_at) VALUES
    -- Initial wallet funding
    (gen_random_uuid(), admin_user_id, NULL, 1000.00, 'DEPOSIT', 'COMPLETED', 'Initial admin wallet funding', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    
    -- John's transactions
    (gen_random_uuid(), john_user_id, NULL, 200.00, 'DEPOSIT', 'COMPLETED', 'Wallet top-up via PayPal', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), john_user_id, john_order1_id, -39.98, 'PAYMENT', 'COMPLETED', 'Payment for Instagram Followers Boost x2', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), john_user_id, john_order2_id, -29.99, 'PAYMENT', 'COMPLETED', 'Payment for Website Traffic Boost', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), john_user_id, NULL, 50.00, 'DEPOSIT', 'COMPLETED', 'Wallet top-up via Credit Card', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    
    -- Jane's transactions
    (gen_random_uuid(), jane_user_id, NULL, 300.00, 'DEPOSIT', 'COMPLETED', 'Wallet top-up via Bank Transfer', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), jane_user_id, jane_order1_id, -79.99, 'PAYMENT', 'COMPLETED', 'Payment for SEO Optimization Package', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), jane_user_id, jane_order2_id, -99.99, 'PAYMENT', 'COMPLETED', 'Payment for Professional Logo Design', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
    (gen_random_uuid(), jane_user_id, jane_order3_id, 149.97, 'REFUND', 'COMPLETED', 'Refund for cancelled Content Writing Service', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    (gen_random_uuid(), jane_user_id, NULL, 5.26, 'DEPOSIT', 'COMPLETED', 'Bonus credit for cancellation inconvenience', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    
    -- Sarah's transactions
    (gen_random_uuid(), sarah_user_id, NULL, 120.00, 'DEPOSIT', 'COMPLETED', 'Wallet top-up via PayPal', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), sarah_user_id, sarah_order1_id, -19.99, 'PAYMENT', 'COMPLETED', 'Payment for Instagram Followers Boost', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    (gen_random_uuid(), sarah_user_id, NULL, -10.02, 'WITHDRAWAL', 'COMPLETED', 'Withdrawal to PayPal account', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    
    -- David's transactions
    (gen_random_uuid(), david_user_id, NULL, 200.00, 'DEPOSIT', 'COMPLETED', 'Wallet top-up via Credit Card', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');
END $$;

-- 6. VERIFICATION QUERIES
-- Check current wallet balances
SELECT 
    u.full_name,
    u.email,
    u.is_admin,
    u.status,
    w.balance as wallet_balance,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as total_orders,
    (SELECT COUNT(*) FROM transactions WHERE user_id = u.id) as total_transactions
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
ORDER BY u.created_at;

-- Check recent orders
SELECT 
    o.id,
    u.full_name as customer,
    s.name as service,
    o.quantity,
    o.unit_price,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN services s ON o.service_id = s.id
ORDER BY o.created_at DESC
LIMIT 10;

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
ORDER BY t.created_at DESC
LIMIT 15;

-- Service categories summary
SELECT 
    category,
    COUNT(*) as service_count,
    AVG(price) as avg_price,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_services
FROM services
GROUP BY category
ORDER BY service_count DESC;

-- SAMPLE LOGIN CREDENTIALS
-- ========================
/*
Admin Account:
Email: admin@demo.com
Password: password123

Regular User Accounts:
Email: john.doe@gmail.com | Password: password123
Email: jane.smith@gmail.com | Password: password123  
Email: sarah.johnson@outlook.com | Password: password123
Email: david.brown@yahoo.com | Password: password123
Email: mike.wilson@gmail.com | Password: password123 (INACTIVE)

All accounts use the same password for testing: password123
*/