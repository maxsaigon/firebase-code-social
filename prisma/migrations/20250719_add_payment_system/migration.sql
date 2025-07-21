-- Migration: Add payment settings and payment methods
-- File: 20250719_add_payment_system.sql

-- Create payment_settings table for admin configuration
CREATE TABLE payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'bitcoin', 'ethereum', etc.
    config JSONB NOT NULL, -- Store API keys, wallet addresses, etc.
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider)
);

-- Create payment_methods table for tracking user payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'stripe_card', 'bitcoin', 'ethereum', etc.
    details JSONB NOT NULL, -- Store payment method details
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_transactions table for tracking all payments
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    provider VARCHAR(50) NOT NULL,
    provider_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create crypto_addresses table for managing crypto payments
CREATE TABLE crypto_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(20) NOT NULL, -- 'BTC', 'ETH', 'USDT', etc.
    address VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

-- Insert default payment settings (inactive by default)
INSERT INTO payment_settings (provider, config, is_active) VALUES
('stripe', '{"publishable_key": "", "secret_key": "", "webhook_secret": ""}', false),
('bitcoin', '{"wallet_address": "", "api_key": "", "network": "mainnet"}', false),
('ethereum', '{"wallet_address": "", "api_key": "", "network": "mainnet"}', false),
('usdt', '{"wallet_address": "", "api_key": "", "network": "ethereum"}', false);

-- Create indexes for better performance
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_crypto_addresses_user_id ON crypto_addresses(user_id);
