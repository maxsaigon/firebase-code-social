# API Documentation - Recent Updates

## Refund API Endpoint

### POST `/api/wallet/refund`

Processes automatic refunds for cancelled orders with transaction safety.

#### Request Body
```typescript
{
  orderId: string;     // The ID of the order to refund
  reason?: string;     // Optional reason for the refund
}
```

#### Response
```typescript
// Success Response (200)
{
  success: true;
  message: string;
  data: {
    refundAmount: number;
    newWalletBalance: number;
    transactionId: string;
  }
}

// Error Response (400/404/500)
{
  success: false;
  message: string;
  error?: string;
}
```

#### Example Usage
```typescript
// Client-side refund request
const response = await fetch('/api/wallet/refund', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: 'order_123',
    reason: 'Service unavailable'
  }),
});

const result = await response.json();
```

#### Implementation Details
- **Transaction Safety**: Uses Prisma `$transaction` for atomic operations
- **Validation**: Verifies order exists and has valid amount
- **Wallet Update**: Automatically increments user wallet balance
- **Audit Trail**: Creates refund transaction record
- **Error Handling**: Comprehensive error responses for different scenarios

#### Database Operations
1. **Validation**: Check if order exists and amount > 0
2. **Transaction Creation**: Create CREDIT transaction record
3. **Wallet Update**: Increment user wallet balance
4. **Atomic Execution**: All operations in single transaction

---

## Enhanced Service API

### Service Status Management

The service API now supports the new status enum system:

#### Service Object Schema
```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';  // Updated from boolean is_active
  category_id: string;
  created_at: string;
  updated_at: string;
}
```

#### GET `/api/services`
Enhanced with status filtering capabilities.

**Query Parameters:**
- `status`: Filter by service status (`ACTIVE` | `INACTIVE`)
- `category_id`: Filter by category
- `search`: Search in name and description

**Example:**
```
GET /api/services?status=ACTIVE&search=web
```

#### POST `/api/services`
Create service with status field.

**Request Body:**
```typescript
{
  name: string;
  description: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  category_id: string;
}
```

#### PUT `/api/services/[id]`
Update service including status changes.

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  price?: number;
  status?: 'ACTIVE' | 'INACTIVE';  // Can update service status
  category_id?: string;
}
```

---

## Order API Enhancements

### Enhanced Order Status Management

#### Order Status Types
```typescript
type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
```

#### PUT `/api/orders/[id]`
Enhanced with automatic refund triggering.

**Status Change Behavior:**
- **CANCELLED**: Automatically triggers refund API
- **REFUNDED**: Manual status for already processed refunds
- **Other Statuses**: Normal status updates

**Request Body:**
```typescript
{
  status?: OrderStatus;
  quantity?: number;
  notes?: string;
  // Other order fields...
}
```

**Response with Refund:**
```typescript
{
  success: true;
  order: Order;
  refund?: {
    amount: number;
    transactionId: string;
    newWalletBalance: number;
  }
}
```

---

## Component API Documentation

### StatusBadge Component

A reusable component for displaying entity statuses with consistent styling.

#### Props Interface
```typescript
interface StatusBadgeProps {
  status: string;
  type: 'user' | 'service' | 'order' | 'transaction';
  className?: string;
}
```

#### Usage Examples
```tsx
// Service status
<StatusBadge status="ACTIVE" type="service" />

// Order status
<StatusBadge status="PENDING" type="order" />

// User status
<StatusBadge status="ACTIVE" type="user" />

// Transaction status
<StatusBadge status="COMPLETED" type="transaction" />
```

#### Color Mapping
```typescript
const statusColors = {
  // Success states
  'ACTIVE': 'success',
  'COMPLETED': 'success',
  
  // Warning states
  'PENDING': 'warning',
  'PROCESSING': 'warning',
  
  // Error states
  'INACTIVE': 'destructive',
  'CANCELLED': 'destructive',
  'REFUNDED': 'destructive',
  
  // Default
  'default': 'secondary'
};
```

---

### Enhanced OrderForm Component

Context-aware form component with dynamic validation and rendering.

#### Props Interface
```typescript
interface OrderFormProps {
  serviceName?: string;
  unitPrice?: number;
  serviceId?: string;
  order?: any;
  onSubmit: (data: CreateOrderData & { status?: OrderStatus }) => void;
  isSubmitting?: boolean;
  users?: Array<{ id: string; full_name?: string; email: string }>;
  services?: Array<{ id: string; name: string; price: number; status: string }>;
  isEditMode?: boolean;
  currentUserId?: string;
}
```

#### Context-Aware Behavior
```typescript
// Admin context - shows user selection
<OrderForm 
  users={users}
  services={services}
  onSubmit={handleSubmit}
/>

// User context - hides user selection
<OrderForm
  serviceName="Web Design"
  unitPrice={299.99}
  serviceId="service_123"
  currentUserId="user_456"
  onSubmit={handleSubmit}
/>
```

#### Dynamic Validation
- **Admin Context**: Requires user selection
- **User Context**: User ID optional (uses currentUserId)
- **Edit Mode**: Additional status field validation

---

## Migration Notes

### Database Schema Changes
```sql
-- Service status migration
ALTER TABLE services ADD COLUMN status_new service_status;
UPDATE services SET status_new = CASE WHEN is_active THEN 'ACTIVE' ELSE 'INACTIVE' END;
ALTER TABLE services DROP COLUMN is_active;
ALTER TABLE services RENAME COLUMN status_new TO status;
```

### Breaking Changes
1. **Service Model**: `is_active` → `status` enum
2. **API Responses**: Boolean replaced with enum strings
3. **Database Queries**: Column name and type changed

### Migration Checklist
- [ ] Run database migration
- [ ] Update frontend service interfaces
- [ ] Replace `is_active` references with `status`
- [ ] Update service filtering logic
- [ ] Test order refund functionality
- [ ] Verify status badge displays correctly

---

## Error Handling

### Common Error Responses

#### Refund API Errors
```typescript
// Order not found
{
  success: false,
  message: "Order not found",
  status: 404
}

// Invalid refund amount
{
  success: false,
  message: "Invalid refund amount",
  status: 400
}

// Database error
{
  success: false,
  message: "Failed to process refund",
  error: "Database connection failed",
  status: 500
}
```

#### Service API Errors
```typescript
// Invalid status
{
  success: false,
  message: "Invalid service status",
  status: 400
}
```

---

This documentation covers all the recent API enhancements and component updates made to the order management system.
