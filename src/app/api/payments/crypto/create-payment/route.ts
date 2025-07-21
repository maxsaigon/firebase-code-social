import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';
import { z } from 'zod';
import crypto from 'crypto';

const createCryptoPaymentSchema = z.object({
  amount: z.number().positive().max(10000, 'Amount exceeds limit'),
  currency: z.enum(['BTC', 'ETH', 'USDT'], {
    errorMap: () => ({ message: 'Unsupported cryptocurrency' })
  })
});

// GET /api/payments/crypto/config - Get supported crypto currencies
export async function GET() {
  try {
    const cryptoSettings = await prisma.paymentSetting.findMany({
      where: { 
        provider: {
          in: ['btc', 'eth', 'usdt']
        },
        isActive: true
      }
    });

    const supportedCurrencies = cryptoSettings.map(setting => ({
      currency: setting.provider.toUpperCase(),
      name: getCurrencyName(setting.provider),
      network: (setting.config as any)?.network || 'mainnet'
    }));

    return NextResponse.json({
      success: true,
      supportedCurrencies
    });

  } catch (error) {
    console.error('❌ Get crypto config failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get crypto configuration' },
      { status: 500 }
    );
  }
}

// POST /api/payments/crypto/create-payment
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    console.log('=== Create Crypto Payment ===');
    
    const body = await request.json();
    const validatedData = createCryptoPaymentSchema.parse(body);
    const { amount, currency } = validatedData;

    // Get crypto settings for the currency
    const cryptoSettings = await prisma.paymentSetting.findUnique({
      where: { provider: currency.toLowerCase() }
    });

    if (!cryptoSettings || !cryptoSettings.isActive) {
      return NextResponse.json(
        { success: false, error: `${currency} payment not available` },
        { status: 503 }
      );
    }

    const config = cryptoSettings.config as any;
    if (!config.wallet_address) {
      return NextResponse.json(
        { success: false, error: `${currency} wallet not configured` },
        { status: 500 }
      );
    }

    // Generate unique payment ID
    const paymentId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create payment transaction record
    const paymentTransaction = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        amount,
        currency,
        provider: currency.toLowerCase(),
        providerTransactionId: paymentId,
        status: 'pending',
        type: 'deposit',
        expiresAt,
        metadata: {
          walletAddress: config.wallet_address,
          network: config.network || 'mainnet',
          memo: config.memo || null
        }
      }
    });

    // Create or get crypto address for tracking
    const cryptoAddress = await prisma.cryptoAddress.upsert({
      where: {
        address_currency: {
          address: config.wallet_address,
          currency
        }
      },
      update: {
        lastUsedAt: new Date()
      },
      create: {
        address: config.wallet_address,
        currency,
        network: config.network || 'mainnet',
        isActive: true,
        lastUsedAt: new Date()
      }
    });

    console.log(`✅ Crypto payment created for user ${user.email}: ${amount} ${currency}`);

    // Calculate estimated rates (mock data - replace with real API)
    const exchangeRates = await getExchangeRates(currency);

    return NextResponse.json({
      success: true,
      data: {
        paymentId,
        transactionId: paymentTransaction.id,
        walletAddress: config.wallet_address,
        amount,
        currency,
        network: config.network || 'mainnet',
        memo: config.memo || null,
        expiresAt,
        estimatedUSD: amount * exchangeRates.usd,
        qrCodeData: generateQRCodeData(config.wallet_address, amount, currency, config.memo)
      }
    });

  } catch (error) {
    console.error('❌ Create crypto payment failed:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create crypto payment' },
      { status: 500 }
    );
  }
});

function getCurrencyName(provider: string): string {
  const names: Record<string, string> = {
    'btc': 'Bitcoin',
    'eth': 'Ethereum',
    'usdt': 'Tether USD'
  };
  return names[provider] || provider.toUpperCase();
}

async function getExchangeRates(currency: string): Promise<{ usd: number }> {
  // Mock exchange rates - replace with real API like CoinGecko
  const mockRates: Record<string, number> = {
    'BTC': 45000,
    'ETH': 3000,
    'USDT': 1
  };
  
  return {
    usd: mockRates[currency] || 1
  };
}

function generateQRCodeData(address: string, amount: number, currency: string, memo?: string): string {
  // Generate QR code data for crypto payment
  let qrData = '';
  
  switch (currency.toUpperCase()) {
    case 'BTC':
      qrData = `bitcoin:${address}?amount=${amount}`;
      break;
    case 'ETH':
      qrData = `ethereum:${address}?value=${amount}`;
      break;
    case 'USDT':
      qrData = `ethereum:${address}?value=${amount}`;
      if (memo) qrData += `&memo=${memo}`;
      break;
    default:
      qrData = address;
  }
  
  return qrData;
}
