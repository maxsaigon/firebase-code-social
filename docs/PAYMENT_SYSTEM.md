# Payment System Implementation Guide

## Overview
The payment system supports both Stripe credit card payments and cryptocurrency payments (Bitcoin, Ethereum, USDT) for users to add funds to their accounts.

## Features Implemented

### 1. Admin Payment Configuration
- **Path**: `/admin/payment`
- **Features**:
  - Configure Stripe API keys (publishable key, secret key, webhook secret)
  - Set up cryptocurrency wallet addresses for BTC, ETH, USDT
  - Enable/disable payment methods
  - Secure credential management with masked display

### 2. User Add Funds Interface
- **Path**: `/user/add-funds`
- **Features**:
  - Credit card payments via Stripe
  - Cryptocurrency payments with QR codes
  - Real-time payment status tracking
  - Automatic balance updates

### 3. Payment Processing APIs

#### Stripe APIs
- `GET /api/payments/stripe/config` - Get public Stripe configuration
- `POST /api/payments/stripe/create-payment-intent` - Create payment intent
- `POST /api/payments/stripe/webhook` - Handle Stripe webhooks

#### Crypto APIs
- `GET /api/payments/crypto/config` - Get supported cryptocurrencies
- `POST /api/payments/crypto/create-payment` - Create crypto payment
- `GET /api/payments/crypto/status` - Check payment status
- `POST /api/payments/crypto/status` - Confirm payment with transaction hash

#### Admin APIs
- `GET /api/admin/payment-settings` - Get payment settings
- `PUT /api/admin/payment-settings` - Update payment settings

## Database Schema

### New Tables Added
1. **payment_settings** - Store provider configurations
2. **payment_methods** - Track available payment methods
3. **payment_transactions** - Record all payment transactions
4. **crypto_addresses** - Track cryptocurrency addresses

### Enhanced Tables
- **users** - Added `balance` field for account balance

## Security Features

### Authentication & Authorization
- All payment APIs require JWT authentication
- Admin endpoints require admin role verification
- User endpoints ensure users can only access their own data

### Data Protection
- Sensitive payment credentials are masked in responses
- Input validation using Zod schemas
- Rate limiting on payment endpoints
- CSRF protection on webhook endpoints

### Financial Security
- Transaction amount limits ($1 - $10,000)
- Payment expiration (30 minutes for crypto)
- Double-spend prevention
- Audit trails for all transactions

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/admin_ecom_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Stripe (optional)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mock mode for testing
MOCK_MODE="true"
```

### 2. Database Migration
```bash
npx prisma db push
```

### 3. Install Dependencies
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js crypto-js qrcode @types/qrcode @radix-ui/react-switch @radix-ui/react-tabs
```

### 4. Configure Payment Providers

#### Stripe Setup
1. Create Stripe account at https://stripe.com
2. Get API keys from Stripe dashboard
3. Configure webhook endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
4. Add webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Add keys to admin payment settings

#### Cryptocurrency Setup
1. Generate wallet addresses for BTC, ETH, USDT
2. Add addresses to admin payment settings
3. Configure appropriate networks (mainnet/testnet)

## Usage Guide

### For Admins
1. Navigate to `/admin/payment`
2. Configure Stripe settings:
   - Add publishable key, secret key, webhook secret
   - Enable Stripe payments
3. Configure crypto settings:
   - Add wallet addresses for each currency
   - Select appropriate networks
   - Enable crypto payments

### For Users
1. Navigate to `/user/add-funds`
2. Choose payment method (Credit Card or Crypto)
3. Enter amount ($1 - $10,000)
4. Complete payment:
   - **Credit Card**: Use Stripe's secure form
   - **Crypto**: Send to provided address with QR code

### Payment Flow

#### Credit Card (Stripe)
1. User enters amount
2. Stripe payment intent created
3. User completes card payment
4. Webhook confirms payment
5. User balance updated automatically

#### Cryptocurrency
1. User selects crypto and amount
2. System generates payment address and QR code
3. User sends crypto to address
4. User optionally submits transaction hash
5. System verifies on blockchain (simulated)
6. Balance updated upon confirmation

## Testing

### Mock Mode
Set `MOCK_MODE="true"` in environment to enable testing without real payments:
- Stripe payments work with test keys
- Crypto payments are simulated with 80% success rate
- No real money is processed

### Test Scenarios
1. **Stripe Testing**:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

2. **Crypto Testing**:
   - Use testnet addresses
   - Simulate transaction hashes
   - Test payment expiration (30 minutes)

## Monitoring & Maintenance

### Logs
- All payment activities are logged
- Error tracking for failed payments
- Audit trails for admin configuration changes

### Database Monitoring
- Monitor payment_transactions table for stuck payments
- Check crypto_addresses for unused addresses
- Regular balance reconciliation

### Security Monitoring
- Monitor for unusual payment patterns
- Alert on large transactions
- Regular security audits of payment flows

## Error Handling

### Common Issues
1. **Stripe webhook failures**: Check webhook secret and endpoint URL
2. **Crypto verification delays**: Normal for blockchain confirmation
3. **Payment timeouts**: Crypto payments expire after 30 minutes
4. **Balance discrepancies**: Check transaction logs for failed webhooks

### Recovery Procedures
1. **Failed Stripe webhook**: Manually verify payment in Stripe dashboard
2. **Stuck crypto payment**: Check blockchain explorer and manually confirm
3. **Balance issues**: Use admin transaction tools to reconcile

## Future Enhancements

### Planned Features
1. **Multi-currency support**: Add more cryptocurrencies
2. **Payment analytics**: Dashboard for payment metrics
3. **Refund system**: Automated refund processing
4. **Recurring payments**: Subscription support
5. **Mobile wallet integration**: Apple Pay, Google Pay
6. **Real crypto verification**: Integrate with blockchain APIs

### Integration Options
1. **CoinGecko API**: Real-time exchange rates
2. **Blockchain APIs**: Automatic transaction verification
3. **Payment processors**: Additional providers (PayPal, etc.)
4. **KYC/AML**: Identity verification for large amounts

## Support

### Documentation
- API documentation available at `/docs`
- Postman collection for testing
- Error code reference guide

### Contact
- Technical issues: Submit GitHub issue
- Payment disputes: Contact admin
- Security concerns: Email security team

---

## API Reference

### Authentication
All payment APIs require Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Error Responses
Standard error format:
```json
{
  "success": false,
  "error": "Error description"
}
```

### Success Responses
Standard success format:
```json
{
  "success": true,
  "data": { ... }
}
```

### Rate Limits
- Payment creation: 10 requests per minute per user
- Status checks: 60 requests per minute per user
- Admin settings: 30 requests per minute

---

*Last updated: January 2025*
*Version: 1.0.0*
