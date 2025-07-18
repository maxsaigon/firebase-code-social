# Social Service Hub Documentation

## Table of Contents
1. [Overview](#1-overview)
2. [Migration Status](#2-migration-status)
3. [Project Structure & File Breakdown](#3-project-structure--file-breakdown)
4. [Core Features & Implementation Logic](#4-core-features--implementation-logic)
5. [How to Use](#5-how-to-use)
6. [PostgreSQL Schema and Database Structure](#6-postgresql-schema-and-database-structure)
7. [Authentication System](#7-authentication-system)
8. [Sample Data & Testing](#8-sample-data--testing)
9. [Contributing Guidelines](#9-contributing-guidelines)

## 1. Overview

Social Service Hub is a comprehensive admin dashboard and user-facing application built with Next.js, React, TypeScript, and PostgreSQL. It provides a robust interface for managing users, services, orders, and financial transactions, with features like CRUD operations, data filtering and sorting, and a responsive UI.

**Key Technologies:**

*   **Frontend Framework:** Next.js 15 (React 18)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, shadcn/ui
*   **State Management & Data Fetching:** TanStack Query
*   **Form Management:** React Hook Form, Zod for validation
*   **Backend & Database:** Self-hosted PostgreSQL 14
*   **Database Client:** node-postgres (pg) for direct SQL queries
*   **Authentication:** Custom NextAuth.js implementation with bcrypt password hashing
*   **ORM:** Prisma (schema definition, migrations)

---

## 2. Migration Status

✅ **COMPLETED: Full-Stack E-Commerce Admin Platform**

**Platform Summary:**
- ✅ Modern Next.js 15 application with App Router
- ✅ Self-hosted PostgreSQL database with Prisma ORM
- ✅ Custom JWT-based authentication system
- ✅ Comprehensive admin dashboard with analytics
- ✅ User portal with wallet and order management
- ✅ AI-powered content optimization with Google Genkit

**Key Features:**
- 🎯 **Admin Dashboard**: Complete management of users, services, orders, and transactions
- 🔒 **User Portal**: Self-service ordering, wallet management, and order tracking
- ⚡ **Performance**: Optimized with server-side rendering and efficient queries
- �️ **Security**: JWT authentication, input validation, and SQL injection protection

---

## 3. Project Structure & File Breakdown

### 3.1. `/` (Root Directory)

*   **`.env`**: Environment variables for PostgreSQL connection (e.g., `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`).
*   **`.env.local`**: Local development environment variables.
*   **`next.config.ts`**: Next.js configuration file.
*   **`package.json`**: Dependencies including `pg`, `bcryptjs`, `next-auth`.
*   **`prisma/`**: Prisma ORM configuration.
    *   **`schema.prisma`**: Database schema definition.
    *   **`migrations/`**: Database migration files.

### 3.2. `/src/app/api/auth` (Authentication APIs)

*   **`register/route.ts`**: User registration with PostgreSQL and bcrypt.
*   **`login/route.ts`**: User login with credential verification and redirect logic.
*   **`logout/route.ts`**: User logout with session cleanup.
*   **`me/route.ts`**: Get current user session data.

### 3.3. `/src/app` (Next.js App Router)

*   **`layout.tsx`**: Root layout with global providers.
*   **`/auth`**: Authentication pages.
    *   **`login/page.tsx`**: User login page.
    *   **`register/page.tsx`**: User registration page.
*   **`/admin`**: Admin dashboard pages.
    *   **`layout.tsx`**: Admin layout with `ProtectedRoute`.
    *   **`dashboard/page.tsx`**: Admin dashboard with statistics.
    *   **`users/page.tsx`**: User management page.
    *   **`services/page.tsx`**: Service management page.
    *   **`orders/page.tsx`**: Order management page.
    *   **`transactions/page.tsx`**: Transaction management page.
*   **`/user`**: User-facing pages.
    *   **`layout.tsx`**: User layout with navigation.
    *   **`page.tsx`**: Available services display.
    *   **`my-orders/page.tsx`**: User's order history.
    *   **`transactions/page.tsx`**: User's transaction history.
    *   **`wallet/page.tsx`**: Wallet management.

### 3.4. `/src/components` (Shared Components)

*   **`shared/`**: Reusable components.
    *   **`ProtectedRoute.tsx`**: Route protection based on authentication and roles.
    *   **`AdminSidebar.tsx`**: Admin navigation sidebar.
    *   **`Header.tsx`**: Application header.
    *   **`DataTable.tsx`**: Reusable data table component.
*   **`ui/`**: shadcn/ui components.

### 3.5. `/docs` (Documentation)

*   **`doc.md`**: This comprehensive documentation file.
*   **`database/`**: PostgreSQL schema and seed files.
    *   **`schema.sql`**: PostgreSQL schema with tables, triggers, and functions.
    *   **`seed.sql`**: Sample data for testing and development.

---

## 4. Core Features & Implementation Logic

### 4.1. Authentication & Authorization

*   **Registration (`/auth/register`)**: 
    *   Users create accounts with email/password/fullName.
    *   Passwords are hashed with bcrypt (12 rounds).
    *   Automatic wallet creation with 0 balance.
    *   Transaction-based user+wallet creation for data consistency.

*   **Login (`/auth/login`)**: 
    *   Email and password verification.
    *   **Redirect Logic**: 
        - Admin users (`is_admin = true`) → `/admin/dashboard`
        - Regular users → `/user`
    *   Only ACTIVE users can login.

*   **Logout**: 
    *   Session cleanup and redirect to `/auth/login`.

*   **Protected Routes**: 
    *   `ProtectedRoute` component wraps admin and user areas.
    *   Checks authentication and admin privileges.
    *   Automatic redirects for unauthorized access.

### 4.2. User Management (`/admin/users`)

*   **CRUD Operations**: Full Create, Read, Update, Delete functionality.
*   **Status Management**: ACTIVE/INACTIVE user status control.
*   **Search & Filtering**: Filter users by status and search by name/email.

### 4.3. Service Management (`/admin/services`, `/user`)

*   **Admin View**: Complete service lifecycle management.
*   **User View**: Browse and order available services.
*   **Categories**: Social Media, Marketing, Content, Design, Development.

### 4.4. Order Management

*   **Order Placement**: 
    1. Wallet balance verification.
    2. Order creation with PENDING status.
    3. Payment transaction creation (negative amount).
    4. Wallet balance automatic update.
    5. Redirect to order confirmation.

*   **Order Status**: PENDING → PROCESSING → COMPLETED/CANCELLED.

### 4.5. Financial System

*   **Wallet Management**: Each user has one wallet with current balance.
*   **Transaction Types**: DEPOSIT, PAYMENT, REFUND, WITHDRAWAL.
*   **Transaction Status**: PENDING, COMPLETED, FAILED.
*   **Automatic Balance Updates**: Database triggers maintain wallet consistency.

---

## 5. How to Use

### 5.1. Development Setup

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd admin-ecom
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up PostgreSQL**:
   ```bash
   # Install PostgreSQL (macOS with Homebrew)
   brew install postgresql@14
   brew services start postgresql@14
   
   # Create database
   createdb admin_ecom_db
   ```

4. **Configure environment variables**:
   ```bash
   # Create .env.local file
   DATABASE_URL="postgresql://localhost:5432/admin_ecom_db"
   NEXTAUTH_URL="http://localhost:9002"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

5. **Set up database schema**:
   ```bash
   # Apply schema
   psql -d admin_ecom_db -f prisma/schema.sql
   
   # Insert sample data
   psql -d admin_ecom_db -f prisma/seed.sql
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

### 5.2. Production Deployment

1. **Database Setup**: Deploy PostgreSQL instance.
2. **Environment Variables**: Configure production DATABASE_URL and secrets.
3. **Schema Migration**: Apply schema.sql to production database.
4. **Build & Deploy**: Standard Next.js deployment process.

---

## 6. PostgreSQL Schema and Database Structure

### 6.1. Core Tables

*   **`users`**: User accounts with authentication data.
    *   Columns: `id`, `email`, `full_name`, `password`, `is_admin`, `status`, `created_at`, `updated_at`
    *   Constraints: Unique email, bcrypt hashed passwords

*   **`wallets`**: User wallet balances.
    *   Columns: `id`, `user_id`, `balance`, `created_at`, `updated_at`
    *   Foreign Key: `user_id` → `users.id`

*   **`services`**: Available services for purchase.
    *   Columns: `id`, `name`, `description`, `price`, `is_active`, `category`, `created_at`, `updated_at`
    *   Categories: social-media, marketing, content, design, development

*   **`orders`**: Service orders placed by users.
    *   Columns: `id`, `user_id`, `service_id`, `quantity`, `unit_price`, `total_amount`, `status`, `created_at`, `updated_at`
    *   Status: PENDING, PROCESSING, COMPLETED, CANCELLED

*   **`transactions`**: Financial transactions affecting wallet balances.
    *   Columns: `id`, `user_id`, `order_id`, `amount`, `type`, `status`, `description`, `created_at`
    *   Types: DEPOSIT, PAYMENT, REFUND, WITHDRAWAL
    *   Status: PENDING, COMPLETED, FAILED

### 6.2. Database Features

*   **Triggers**: Automatic wallet balance updates on transaction changes.
*   **Constraints**: Foreign key relationships and data integrity.
*   **Indexes**: Optimized queries on email, user_id, and timestamps.
*   **Enums**: Status and type fields with controlled values.

---

## 7. Authentication System

### 7.1. Implementation Details

*   **Password Security**: bcryptjs with 12 rounds of hashing.
*   **Session Management**: NextAuth.js integration (prepared for future JWT/session tokens).
*   **User Registration**: Email/password with automatic wallet creation.
*   **Login Flow**: Credential verification with role-based redirects.

### 7.2. API Endpoints

*   `POST /api/auth/register` - User registration
*   `POST /api/auth/login` - User login
*   `POST /api/auth/logout` - User logout
*   `GET /api/auth/me` - Get current session
*   `POST /api/auth/me` - Get user by ID

### 7.3. Protection Levels

*   **Public Routes**: `/auth/login`, `/auth/register`
*   **User Routes**: `/user/*` (requires authentication)
*   **Admin Routes**: `/admin/*` (requires authentication + admin role)

---

## 8. Sample Data & Testing

### 8.1. Test Accounts

All test accounts use password: `password123`

**Admin Account:**
- Email: `admin@demo.com`
- Role: Administrator
- Wallet: $1,000.00

**Regular Users:**
- `john.doe@gmail.com` - Wallet: $150.50, 3 orders
- `jane.smith@gmail.com` - Wallet: $275.25, 3 orders  
- `sarah.johnson@outlook.com` - Wallet: $89.99, 2 orders
- `david.brown@yahoo.com` - Wallet: $200.00, 2 orders
- `mike.wilson@gmail.com` - INACTIVE status (login disabled)

### 8.2. Sample Services

**12 services across 5 categories:**
- Social Media: Instagram Followers ($19.99), TikTok Views ($14.99), YouTube Subscribers ($39.99)
- Marketing: Website Traffic ($29.99), SEO Package ($79.99), Google Ads ($149.99)
- Content: Writing Service ($49.99), Video Editing ($89.99)
- Design: Logo Design ($99.99)
- Development: Landing Page ($199.99), WordPress Setup ($159.99), App Consultation ($299.99)

### 8.3. Test Scenarios

*   **User Registration**: Test with new email addresses.
*   **Admin Login**: Use admin account to access dashboard.
*   **User Login**: Use regular accounts to access user area.
*   **Order Placement**: Test service ordering with wallet balance checks.
*   **Transaction History**: View deposits, payments, and refunds.

---

## 9. Contributing Guidelines

### 9.1. Development Standards

*   **TypeScript**: Strict type checking enabled.
*   **Code Style**: ESLint and Prettier configurations.
*   **Database**: Use direct SQL queries with parameterized statements.
*   **Security**: Never store plain text passwords, validate all inputs.

### 9.2. Database Changes

*   **Schema Updates**: Modify `prisma/schema.sql`.
*   **Sample Data**: Update `prisma/seed.sql`.
*   **Testing**: Verify with fresh database installation.

### 9.3. Authentication

*   **Password Changes**: Update bcrypt rounds if needed.
*   **Session Management**: Future JWT implementation ready.
*   **Role Management**: Extend `is_admin` to more granular permissions.

---

## Migration Complete ✅

This application is a modern, full-stack e-commerce admin platform built with Next.js 15 and PostgreSQL, providing:

- **Complete Management Suite**: Admin dashboard and user portal
- **Self-Hosted Infrastructure**: Full control over data and operations
- **Modern Technology Stack**: Next.js 15, TypeScript, and Prisma ORM
- **Scalable Architecture**: Built for growth and customization

The migration maintains all original functionality while providing greater control and cost efficiency for production use.
