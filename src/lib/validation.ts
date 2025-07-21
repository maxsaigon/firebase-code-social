import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(255, 'Full name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  is_admin: z.boolean().optional()
});

export const updateUserSchema = z.object({
  email: z.string().email().max(255).optional(),
  password: z.string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
    .optional(),
  full_name: z.string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .optional(),
  is_admin: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Service validation schemas
export const createServiceSchema = z.object({
  name: z.string()
    .min(1, 'Service name is required')
    .max(255, 'Service name too long'),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description too long'),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category too long'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
});

export const updateServiceSchema = createServiceSchema.partial();

// Order validation schemas
export const createOrderSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  service_id: z.string().uuid('Invalid service ID'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity too high'),
  notes: z.string().max(500, 'Notes too long').optional()
});

export const updateOrderSchema = z.object({
  quantity: z.number()
    .int()
    .min(1)
    .max(1000)
    .optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  notes: z.string().max(500).optional()
});

// Financial validation schemas
export const refundOrderSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  reason: z.string().max(500, 'Reason too long').optional()
});

export const addFundsSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(10000, 'Amount exceeds daily limit')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  description: z.string()
    .min(1, 'Description is required')
    .max(255, 'Description too long')
});

// General validation schemas
export const uuidSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

// Input sanitization
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break SQL
    .substring(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Rate limiting configuration
export const rateLimits = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 attempts per window
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  },
  financial: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 financial operations per hour
  }
};

// Allowed fields for dynamic updates (prevent injection)
export const allowedUserUpdateFields = ['email', 'full_name', 'is_admin', 'status', 'password'];
export const allowedServiceUpdateFields = ['name', 'description', 'price', 'category', 'status'];
export const allowedOrderUpdateFields = ['quantity', 'status', 'notes'];
