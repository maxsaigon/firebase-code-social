# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-07-18

### 🎯 Major Features Added

#### Service Status System
- **NEW**: Service status enum (`ACTIVE`/`INACTIVE`) replacing boolean `is_active`
- **NEW**: Database migration with data transformation
- **NEW**: StatusBadge component for consistent status display across the app
- **IMPROVED**: Service filtering on user page shows only active services

#### Enhanced Order Management
- **NEW**: Context-aware OrderForm component
- **NEW**: Dynamic validation schemas based on admin vs user context
- **NEW**: Automatic refund system for cancelled orders
- **NEW**: Order status editing with visual feedback
- **IMPROVED**: User interface hides unnecessary fields in user context

#### Refund System
- **NEW**: `/api/wallet/refund` endpoint for automatic refunds
- **NEW**: Transaction-safe refund processing with Prisma
- **NEW**: Automatic wallet balance updates
- **NEW**: Refund transaction logging for audit trails

### 🔧 Technical Improvements

#### Type Safety
- **IMPROVED**: Enum consistency across database and frontend
- **IMPROVED**: TypeScript interfaces updated for service status
- **IMPROVED**: Zod validation schemas enhanced for context-aware validation

#### User Experience
- **IMPROVED**: Conditional rendering in OrderForm based on user role
- **IMPROVED**: Service availability indicators on user page
- **IMPROVED**: Status badge color coding for better visual feedback
- **FIXED**: Variable naming conflicts in OrderForm component

#### Database Schema
- **CHANGED**: `services.is_active` (boolean) → `services.status` (enum)
- **ADDED**: `service_status` enum type to PostgreSQL
- **MIGRATION**: Safe data transformation preserving existing data

### 🐛 Bug Fixes

#### OrderForm Component
- **FIXED**: User selection inappropriately showing in user context
- **FIXED**: Service ID validation errors in user context
- **FIXED**: Variable name conflicts between props and watch values
- **FIXED**: Missing validation for optional user_id in user context

#### Service Display
- **FIXED**: User page showing inactive services as available
- **FIXED**: Service filtering not respecting status
- **FIXED**: Enum case mismatch between database and frontend

### 📁 Files Changed

#### New Files
```
prisma/migrations/20250718_add_service_status/migration.sql
src/components/shared/StatusBadge.tsx
src/app/api/wallet/refund/route.ts
docs/ORDER_SYSTEM_UPDATE.md
```

#### Modified Files
```
src/components/OrderForm.tsx
src/app/user/page.tsx
src/types/index.ts
README.md
```

### 🔄 Migration Guide

#### Database Migration
```sql
-- Run the migration
npx prisma migrate deploy

-- Or manually execute:
-- 1. Create enum type
-- 2. Add new status column
-- 3. Transform data: true -> 'ACTIVE', false -> 'INACTIVE'
-- 4. Drop old is_active column
-- 5. Rename status_new to status
```

#### Code Changes Required
1. **Service Interfaces**: Update `is_active: boolean` to `status: 'ACTIVE' | 'INACTIVE'`
2. **Service Queries**: Replace `is_active: true` with `status: 'ACTIVE'`
3. **Status Display**: Use `StatusBadge` component instead of custom status rendering

### 🎨 Component Usage Examples

#### StatusBadge Component
```tsx
import { StatusBadge } from '@/components/shared/StatusBadge';

// Service status
<StatusBadge status={service.status} type="service" />

// Order status  
<StatusBadge status={order.status} type="order" />
```

#### Enhanced OrderForm
```tsx
// Admin context (shows user selection)
<OrderForm
  users={users}
  services={services}
  onSubmit={handleSubmit}
/>

// User context (hides user selection)
<OrderForm
  serviceName={service.name}
  unitPrice={service.price}
  serviceId={service.id}
  currentUserId={user.id}
  onSubmit={handleSubmit}
/>
```

### ⚠️ Breaking Changes

1. **Service Model**: `is_active` property removed, use `status` instead
2. **API Responses**: Service objects now return `status` enum instead of `is_active` boolean
3. **Database Schema**: Direct SQL queries need to be updated to use new enum column

### 🔮 Next Steps

- [ ] Add order status change notifications
- [ ] Implement partial refund capabilities  
- [ ] Add status change history tracking
- [ ] Enhance bulk operations for orders
- [ ] Add email notifications for status changes

---

## [1.0.0] - 2025-07-17

### Initial Release
- Basic admin dashboard functionality
- User management system
- Service management with boolean status
- Order processing
- Wallet system
- PostgreSQL migration from Supabase
