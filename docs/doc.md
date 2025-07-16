# Social Service Hub Documentation

## Table of Contents
1. [Overview](#1-overview)
2. [Project Structure & File Breakdown](#2-project-structure--file-breakdown)
3. [Core Features & Implementation Logic](#3-core-features--implementation-logic)
4. [How to Use](#4-how-to-use)
5. [Known Issues & Future Plans](#5-known-issues--future-plans)
6. [Supabase Schema and Row Level Security (RLS)](#6-supabase-schema-and-row-level-security-rls)
7. [Planning for Self-Hosted Database Alternative](#7-planning-for-self-hosted-database-alternative)
8. [Contributing Guidelines](#8-contributing-guidelines)

## 1. Overview

Social Service Hub is a comprehensive admin dashboard and user-facing application built with Next.js, React, TypeScript, and Supabase. It provides a robust interface for managing users, services, orders, and financial transactions, with features like CRUD operations, data filtering and sorting, and a responsive UI.

**Key Technologies:**

*   **Frontend Framework:** Next.js (React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, shadcn/ui
*   **State Management & Data Fetching:** TanStack Query
*   **Form Management:** React Hook Form, Zod for validation
*   **Backend & Database:** Supabase (PostgreSQL, Authentication, Edge Functions)

---

## 2. Project Structure & File Breakdown

This section provides a detailed breakdown of the project's structure and the purpose of each file and directory.

### 2.1. `/` (Root Directory)

*   **`.env`**: Environment variables for Supabase URL and Anon Key (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
*   **`next.config.ts`**: Next.js configuration file, including environment variable exposure and image optimization.
*   **`package.json`**: Defines project metadata, dependencies, and scripts (e.g., `dev`, `build`, `typecheck`).
*   **`tsconfig.json`**: TypeScript compiler options, including path aliases (`@/*`) for cleaner imports.
*   **`tailwind.config.ts`**: Tailwind CSS configuration, including theme customizations.
*   **`postcss.config.mjs`**: PostCSS configuration for processing CSS.
*   **`README.md`**: General information about the project.
*   **`docs/`**: Contains project documentation.
    *   **`blueprint.md`**: High-level project vision, core features, style guidelines, and current status.
    *   **`CONTRIBUTING.md`**: UI/UX design system, component patterns, and implementation guidelines.
    *   **`doc.md`**: This detailed documentation file.
    *   **`supabase/`**: Supabase-specific documentation.
        *   **`schema.sql`**: PostgreSQL schema definition, including tables, functions, triggers, and RLS policies.
        *   **`seed.sql`**: Sample data for populating the Supabase database.
        *   **`edge_functions/`**: Contains the source code for Supabase Edge Functions.
            *   **`create-user-profile-and-wallet.ts`**: Edge Function for post-signup user profile and wallet creation.

### 2.2. `/src`

This directory contains the core source code of the application.

#### 2.2.1. `/api`

Contains all API functions for interacting with the Supabase backend. Each file encapsulates CRUD operations for a specific resource.

*   **`authApi.ts`**: Handles user authentication (login, register, logout, get current user).
*   **`userApi.ts`**: Manages `public.users` table data (get, create, update, delete users).
*   **`serviceApi.ts`**: Manages `public.services` table data.
*   **`orderApi.ts`**: Manages `public.orders` table data.
*   **`transactionApi.ts`**: Manages `public.transactions` table data.
*   **`addFundApi.ts`**: Handles wallet-related operations, including fetching wallet balance and creating deposit/withdrawal transactions.

#### 2.2.2. `/app`

This directory follows Next.js App Router conventions, defining routes and layouts.

*   **`layout.tsx`**: Root layout for the entire application, setting up global providers (Auth, React Query, Toaster).
*   **`globals.css`**: Global CSS styles.
*   **`favicon.ico`**: Application favicon.
*   **`not-found.tsx`**: Custom 404 page.
*   **`/admin`**: Route group for admin-specific pages.
    *   **`layout.tsx`**: Admin layout, including `AdminSidebar` and `ProtectedRoute` for admin access control.
    *   **`dashboard/page.tsx`**: Admin dashboard displaying key statistics.
    *   **`users/page.tsx`**: User management page with CRUD operations.
    *   **`services/page.tsx`**: Service management page with CRUD operations.
    *   **`orders/page.tsx`**: Order management page with CRUD operations.
    *   **`transactions/page.tsx`**: Transaction management page with CRUD operations.
    *   **`ai-tools/page.tsx`**: Page for AI-powered tools (e.g., Service Description Optimizer).
*   **`/auth`**: Route group for authentication pages.
    *   **`layout.tsx`**: Authentication layout.
    *   **`login/page.tsx`**: User login page.
    *   **`register/page.tsx`**: User registration page.
*   **`/user`**: Route group for user-facing pages.
    *   **`layout.tsx`**: User layout with navigation.
    *   **`page.tsx` (Home)**: Displays available services and allows users to place orders.
    *   **`my-orders/page.tsx`**: Displays a user's order history.
    *   **`order-service/page.tsx`**: Dedicated page for ordering a new service (alternative to modal).
    *   **`transactions/page.tsx`**: Displays a user's transaction history.
    *   **`wallet/page.tsx`**: Manages user wallet balance, including adding/withdrawing funds.

#### 2.2.3. `/components`

Contains reusable UI components.

*   **`/shared`**: Common components used across different parts of the application.
    *   **`AdminSidebar.tsx`**: Navigation sidebar for the admin panel.
    *   **`DashboardCard.tsx`**: Card component for displaying statistics.
    *   **`DataTable.tsx`**: Generic table component for displaying data.
    *   **`LoadingSpinner.tsx`**: Loading indicator.
    *   **`ProtectedRoute.tsx`**: Component for enforcing route protection based on authentication and roles.
*   **`/ui`**: Contains [shadcn/ui](https://ui.shadcn.com/) primitive components, which are reusable, accessible, and customizable UI primitives.
*   **`OrderForm.tsx`**: Form for creating and editing orders.
*   **`ServiceForm.tsx`**: Form for creating and editing services.
*   **`TransactionForm.tsx`**: Form for creating and editing transactions.
*   **`UserForm.tsx`**: Form for creating and editing users.
*   **`service-optimizer.tsx`**: AI-powered service description optimization component.

#### 2.2.4. `/contexts`

*   **`AuthProvider.tsx`**: React context provider that manages the application's authentication state, making user information available to all components. It handles session management and user profile fetching.

#### 2.2.5. `/hooks`

Contains custom React hooks for shared logic and data fetching.

*   **`useAuth.ts`**: Provides easy access to the authentication context (user data, login/logout functions).
*   **`useDebounce.ts`**: Hook to debounce input values, useful for search and filter fields.
*   **`useOrders.ts`**: React Query hooks for `public.orders` data.
*   **`useServices.ts`**: React Query hooks for `public.services` data.
*   **`useTransactions.ts`**: React Query hooks for `public.transactions` data.
*   **`useWallet.ts`**: React Query hooks for `public.wallets` data.
*   **`use-mobile.tsx`**: Detects if the application is viewed on a mobile device.
*   **`use-toast.ts`**: Hook for displaying toast notifications using `shadcn/ui`'s toaster.

#### 2.2.6. `/lib`

*   **`supabaseClient.ts`**: Initializes and exports the Supabase client, reading credentials from environment variables.
*   **`utils.ts`**: Contains utility functions, such as `cn` for merging Tailwind CSS classes.
*   **`actions.ts`**: Server Actions for AI-powered features (e.g., `optimizeServiceDescription`).

#### 2.2.7. `/types`

*   **`index.ts`**: Contains all TypeScript type definitions for the application's data structures (e.g., `User`, `Order`, `Service`, `Transaction`, `Wallet`, `DashboardStats`).

---

## 3. Core Features & Implementation Logic

### 3.1. Authentication & Authorization

*   **Login (`/auth/login`)**: Users sign in using email and password. Upon successful authentication, the system fetches the user's profile from `public.users`.
    *   **Redirection Logic**: If `user.is_admin` is `true`, the user is redirected to `/admin/dashboard`. Otherwise, they are redirected to `/user`.
*   **Registration (`/auth/register`)**: New users can create an account.
    *   **Post-Confirmation Edge Function**: User profile (`public.users`) and wallet (`public.wallets`) creation is handled by a Supabase Edge Function triggered *after* successful `auth.users` signup. This ensures data consistency and avoids database trigger complexities.
*   **Logout**: Available in both admin and user layouts, clearing the session and redirecting to `/auth/login`.
*   **Protected Routes**: The `ProtectedRoute` component (`src/components/shared/ProtectedRoute.tsx`) wraps layouts or pages to enforce access control.
    *   It checks `user` and `loading` states from `useAuth()`.
    *   If `requireAdmin` is `true` and the user is not an admin, they are redirected to `/user`.
    *   If not authenticated, they are redirected to `/auth/login`.

### 3.2. User Management (`/admin/users`)

*   **CRUD Operations**: Full Create, Read, Update, Delete functionality for user accounts.
*   **Data Fetching**: `useUsers` hook (React Query) fetches user data, supporting search and status filters.
*   **Forms**: `UserForm` component handles user data input and validation (Zod).
*   **Modals**: Dialog components (`shadcn/ui`) are used for "Add User" and "Edit User" forms.

### 3.3. Service Management (`/admin/services`, `/user`)

*   **Admin View (`/admin/services`)**: Full CRUD operations for service offerings.
    *   `useServices` hook fetches service data.
    *   `ServiceForm` handles input.
    *   `ServiceCard` displays individual service details.
*   **User View (`/user`)**: Displays available services.
    *   "Order Now" button triggers a modal (`shadcn/ui Dialog`) containing the `OrderForm`.
    *   **Order Placement Logic**:
        1.  **Wallet Balance Check**: Before creating an order, the system checks the user's `public.wallets` balance via `addFundApi.getWallet`.
        2.  **Order Creation**: If funds are sufficient, `orderApi.createOrder` is called.
        3.  **Payment Transaction**: A corresponding `payment` transaction is immediately created in `public.transactions` via `transactionApi.createTransaction`. The `amount` is negative to reflect a debit.
        4.  **Wallet Update (Backend Trigger)**: The `update_wallet_balance` trigger in Supabase automatically updates the user's wallet balance based on the `completed` transaction.
        5.  **Redirection**: User is redirected to `/user/my-orders`.

### 3.4. Order Management (`/admin/orders`, `/user/my-orders`)

*   **Admin View (`/admin/orders`)**: Full CRUD operations for all orders.
    *   `useOrders` hook fetches order data, supporting search and status filters.
    *   `OrderForm` handles input.
*   **User View (`/user/my-orders`)**: Displays orders specific to the logged-in user.
    *   `useOrders` is used, but will need to be filtered by `user_id` in the API layer for production.

### 3.5. Transaction Management (`/admin/transactions`, `/user/transactions`)

*   **Admin View (`/admin/transactions`)**: Full CRUD operations for all financial transactions.
    *   `useTransactions` hook fetches transaction data, supporting search, type, and status filters.
    *   `TransactionForm` handles input.
*   **User View (`/user/transactions`)**: Displays transactions specific to the logged-in user.
    *   `useTransactions` is used, but will need to be filtered by `user_id` in the API layer for production.

### 3.6. Wallet Management (`/user/wallet`)

*   **Balance Display**: Shows the current wallet balance.
*   **Add/Withdraw Funds**: Modals allow users to add or withdraw funds.
    *   These actions create `deposit` or `withdrawal` transactions in `public.transactions`.
    *   The `update_wallet_balance` trigger automatically adjusts the wallet balance.

### 3.7. AI Tools (`/admin/ai-tools`)

*   **Service Description Optimizer**: Integrates an AI-powered tool (`service-optimizer.tsx`) that uses Next.js Server Actions (`src/lib/actions.ts`) to process and optimize service descriptions.

---

## 4. How to Use

1.  **Clone the repository**: `git clone [repository-url]` and navigate to the project directory.
2.  **Install dependencies**: Run `npm install` or `bun install`.
3.  **Set up Supabase Project**:
    *   Create a new Supabase project.
    *   **Apply Schema**: Copy the *entire content* of `docs/supabase/schema.sql` into your Supabase SQL Editor and run it. This will create all necessary tables, functions, and RLS policies.
    *   **Seed Data (Optional but Recommended)**: Copy the *entire content* of `docs/supabase/seed.sql` into your Supabase SQL Editor and run it to populate your database with sample users, services, orders, and wallets.
    *   **Configure Environment Variables**:
        *   Create a `.env.local` file in the root of your project.
        *   Add your Supabase Project URL and Anon Key:
            ```
            NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
            NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
            ```
    *   **Deploy Post-Confirmation Edge Function**:
        *   In your Supabase Dashboard, navigate to **"Edge Functions"**.
        *   Click **"New Function"**.
        *   **Name**: `create-user-profile-and-wallet`
        *   **Trigger Type**: `Auth`
        *   **Event**: `Sign Up (Post-Confirmation)`
        *   **Language**: `TypeScript`
        *   Copy the content of `docs/supabase/edge_functions/create-user-profile-and-wallet.ts` into the function editor.
        *   **Set Edge Function Environment Variables**: In your Supabase project settings, under "Edge Functions" -> "Environment Variables", add:
            *   `SUPABASE_URL`: Your Supabase project URL.
            *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (found under Project Settings -> API Keys). **This key has full database access and must be kept secret.**
4.  **Start the development server**: Run `npm run dev`.
5.  **Access the application**: Open your browser and navigate to `http://localhost:9002`.
    *   **Admin Dashboard**: Available at `/admin/dashboard`. Log in with an admin user (e.g., `admin@demo.com` if you used `seed.sql`).
    *   **User Pages**: Available at `/user`. Log in with a regular user (e.g., `john.doe@gmail.com` if you used `seed.sql`).

---

## 5. Known Issues & Future Plans

### 5.1. Known Issues

*   **User Registration (Post-Confirmation Edge Function)**: While the Edge Function is the intended solution for reliable user profile and wallet creation, its successful implementation relies on a clean Supabase project state. If previous database triggers were not fully removed or caused lingering issues, a fresh Supabase project might be necessary for this to work seamlessly.
*   **Login Button Stuck (Potential Browser Cache Issue)**: During development, the login button might appear stuck after a successful authentication request (200 OK in network tab), with no further console output. This behavior is highly unusual and suggests a client-side issue, potentially related to browser caching or extensions interfering with JavaScript execution. A hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or clearing browser cache/cookies often resolves this. This is noted as a potential intermittent development-time issue.
*   **Data Filtering (Frontend vs. Backend)**: While filter states are implemented in the UI for user, order, and transaction management, the API calls (`userApi.getUsers`, `orderApi.getOrders`, `transactionApi.getTransactions`) currently fetch all data and filter on the client-side. For production-ready applications with large datasets, these API calls should be enhanced to leverage Supabase's powerful filtering and pagination capabilities directly in the backend queries.

### 5.2. Future Plans

*   **Implement Server-Side Filtering/Pagination**: Enhance API functions to push filtering and pagination logic to the Supabase backend for improved performance with large datasets.
*   **Stripe Integration for Wallet**: Integrate a payment gateway (e.g., Stripe) for secure and real-world "Add Funds" functionality in the user wallet.
*   **Comprehensive Unit & Integration Tests**: Develop a robust suite of tests to ensure the reliability and correctness of all features and data flows.
*   **Real-time Updates**: Explore Supabase Realtime capabilities for instant updates on dashboards and user-specific data (e.g., new orders, wallet changes).
*   **Notifications System**: Implement a notification system for users and admins (e.g., order status changes, new user registrations).
*   **Service Description Optimizer Enhancement**: Further develop the AI tool with more sophisticated models and user feedback mechanisms.

---

## 6. Supabase Schema and Row Level Security (RLS)

For detailed information on the Supabase database schema, Row Level Security (RLS) policies, functions, triggers, and helper views, please refer to the dedicated schema file:

*   [Supabase Schema and RLS Documentation](./supabase/schema.sql)

For sample data to populate your Supabase tables, refer to:

*   [Supabase Sample Data](./supabase/seed.sql)

---

## 7. Planning for Self-Hosted Database Alternative

While Supabase provides a powerful and convenient backend-as-a-service, there might be scenarios where a self-hosted database solution is preferred (e.g., for full control, specific compliance requirements, or cost optimization at scale). This section outlines key considerations and components for migrating away from Supabase's managed services to a self-hosted setup.

### 7.1. Database (PostgreSQL)

*   **Choice**: PostgreSQL remains the recommended relational database due to its robustness, extensibility, and compatibility with the existing schema.
*   **Hosting**:
    *   **Cloud VMs**: Deploy PostgreSQL on a cloud virtual machine (e.g., AWS EC2, Google Cloud Compute Engine, Azure VM). Requires manual setup, maintenance, and scaling.
    *   **Managed Database Services (Self-Managed)**: Use cloud provider's managed PostgreSQL services (e.g., AWS RDS, Google Cloud SQL, Azure Database for PostgreSQL) but manage the instance yourself (e.g., backups, scaling, security). This offers a balance between control and operational overhead.
    *   **Kubernetes**: Deploy PostgreSQL using operators (e.g., Crunchy Data PostgreSQL Operator, Zalando's Patroni) on a Kubernetes cluster for high availability and scalability.
*   **Backup & Recovery**: Implement a robust strategy for daily backups (e.g., `pg_dump`, WAL archiving) and define recovery point objectives (RPO) and recovery time objectives (RTO).
*   **Monitoring**: Set up monitoring tools (e.g., Prometheus, Grafana, Datadog) to track database performance, health, and resource utilization.
*   **Security**: Secure the database with strong passwords, SSL/TLS encryption, network firewalls, and regular security audits.

### 7.2. Authentication Service

Supabase Auth provides user management, JWT issuance, and social logins. A self-hosted alternative would need to replicate this functionality.

*   **Keycloak**: An open-source Identity and Access Management (IAM) solution.
    *   **Features**: User federation, strong authentication, user management, social login, SAML, OpenID Connect.
    *   **Integration**: Requires integrating Keycloak's authentication flows into the Next.js application and configuring it to issue JWTs that your backend can validate.
    *   **Hosting**: Can be self-hosted on VMs, Docker, or Kubernetes.
*   **Auth0/Okta (Self-Managed Instances)**: While primarily SaaS, some enterprise plans might offer self-managed instances or private cloud deployments.
*   **Custom Implementation**: Develop a custom authentication service using frameworks like Node.js (Express/Fastify), Python (Django/Flask), or Go. This involves:
    *   User registration, login, password hashing.
    *   JWT generation and validation.
    *   Session management.
    *   Potentially integrating with OAuth providers for social logins.

### 7.3. Storage (File Storage)

Supabase Storage provides object storage for user-uploaded files (e.g., avatars).

*   **MinIO**: An open-source S3-compatible object storage server.
    *   **Features**: High performance, S3 API compatibility, distributed storage.
    *   **Integration**: Use an S3-compatible client library in your Next.js application to interact with MinIO.
    *   **Hosting**: Can be self-hosted on bare metal, VMs, Docker, or Kubernetes.
*   **Cloud Object Storage**: Use cloud provider's object storage services (e.g., AWS S3, Google Cloud Storage, Azure Blob Storage) directly. This is a managed service but you retain control over data.

### 7.4. Realtime Functionality

Supabase Realtime provides WebSocket-based real-time updates.

*   **WebSockets (Custom)**: Implement a custom WebSocket server using libraries like `ws` (Node.js), `Socket.IO`, or `Phoenix Channels` (Elixir).
*   **Message Brokers**: Use message brokers like RabbitMQ or Apache Kafka for pub/sub messaging to distribute real-time updates to connected clients.
*   **Managed Realtime Services**: Consider managed WebSocket services (e.g., AWS IoT Core, Google Cloud Pub/Sub with WebSockets) if you prefer not to manage the infrastructure.

### 7.5. Edge Functions (Serverless Functions)

Supabase Edge Functions are Deno-based serverless functions.

*   **Self-Hosted Serverless Platforms**:
    *   **OpenFaaS**: Open-source serverless platform that runs on Kubernetes.
    *   **Knative**: Kubernetes-native serverless platform.
    *   **AWS Lambda/Google Cloud Functions/Azure Functions (Self-Managed)**: Deploy functions to cloud provider's serverless platforms, but manage deployment and configuration yourself.
*   **Custom API Endpoints**: For simpler logic, replace Edge Functions with traditional API endpoints in your self-hosted backend application.

### 7.6. Migration Strategy

*   **Phased Migration**: Migrate services one by one (e.g., first database, then auth, then storage) to minimize risk.
*   **Data Migration**: Plan for migrating existing data from Supabase to your self-hosted database. Use tools like `pg_dump` and `pg_restore`.
*   **Testing**: Thoroughly test each migrated component to ensure functionality, performance, and security.
*   **Monitoring & Logging**: Establish comprehensive monitoring and logging for all self-hosted components.

---

## 8. Contributing Guidelines

For UI/UX design principles, component design patterns, implementation guidelines, and page-specific implementation details, please refer to the contributing guidelines:

*   [Contributing Guidelines](./CONTRIBUTING.md)
