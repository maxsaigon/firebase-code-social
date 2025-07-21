import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const paymentSettingSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  config: z.object({}).passthrough(), // Allow any config structure
  isActive: z.boolean().optional()
});

// GET /api/admin/payment-settings - Get all payment settings
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  try {
    console.log('=== Get Payment Settings API Started ===');

    const settings = await prisma.paymentSetting.findMany({
      orderBy: { provider: 'asc' }
    });

    // Hide sensitive data in response
    const sanitizedSettings = settings.map(setting => ({
      ...setting,
      config: {
        ...setting.config,
        // Hide sensitive keys, only show if they exist
        secret_key: (setting.config as any).secret_key ? '***HIDDEN***' : '',
        api_key: (setting.config as any).api_key ? '***HIDDEN***' : '',
        webhook_secret: (setting.config as any).webhook_secret ? '***HIDDEN***' : ''
      }
    }));

    console.log(`✅ Retrieved ${settings.length} payment settings by admin ${user.email}`);
    
    return NextResponse.json({
      success: true,
      data: sanitizedSettings
    });

  } catch (error) {
    console.error('❌ Get payment settings failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment settings' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/payment-settings - Update payment setting
export const PUT = withAdminAuth(async (request: NextRequest, user) => {
  try {
    console.log('=== Update Payment Settings API Started ===');
    
    const body = await request.json();
    const validatedData = paymentSettingSchema.parse(body);
    const { provider, config, isActive } = validatedData;

    // Update or create payment setting
    const setting = await prisma.paymentSetting.upsert({
      where: { provider },
      update: {
        config,
        isActive: isActive ?? false,
        updatedAt: new Date()
      },
      create: {
        provider,
        config,
        isActive: isActive ?? false
      }
    });

    console.log(`✅ Payment setting updated for ${provider} by admin ${user.email}`);

    // Return sanitized response
    const sanitizedSetting = {
      ...setting,
      config: {
        ...setting.config,
        secret_key: (setting.config as any).secret_key ? '***HIDDEN***' : '',
        api_key: (setting.config as any).api_key ? '***HIDDEN***' : '',
        webhook_secret: (setting.config as any).webhook_secret ? '***HIDDEN***' : ''
      }
    };

    return NextResponse.json({
      success: true,
      data: sanitizedSetting,
      message: 'Payment setting updated successfully'
    });

  } catch (error) {
    console.error('❌ Update payment setting failed:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update payment setting' },
      { status: 500 }
    );
  }
});
