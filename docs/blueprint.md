# **App Name**: Service Central

## Core Features:

- Dashboard Overview: Centralized admin dashboard for managing users, services, orders, and transactions.
- User Management: User management tools for adding, editing, and deleting user accounts, as well as viewing detailed user information.
- Service Management: Service management module for creating, updating, and removing service listings.
- Order Tracking: Order tracking system to monitor and manage orders.
- Transaction Viewer: Transaction history viewer to track financial transactions related to orders and services.
- Authentication: Authentication system allowing to only authorized users can access the admin panel.
- Service Description Optimizer: AI-powered tool that analyzes existing service descriptions and suggests improvements for clarity and appeal.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) to convey trust and reliability.
- Background color: Very light gray (#F5F5F5) for a clean, neutral backdrop.
- Accent color: Teal (#009688) to highlight key actions and information, contrasting with the indigo for visual interest.
- Body text font: 'PT Sans' (sans-serif) for a clear, modern and slightly warm and personal feel; chosen for readability in both headings and body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, line-based icons to represent different services and actions. Consistency in style and size is crucial.
- Employ a clean, grid-based layout to ensure content is well-organized and easy to navigate. Use white space generously to avoid clutter.

## Project Status & Implementation Details:

This section outlines the current state of the Service Central project, detailing implemented features and key architectural decisions.

### 1. Core Setup & Infrastructure:
- **Supabase Integration**: Configured Supabase client (`src/lib/supabaseClient.ts`) for seamless backend communication. Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are now correctly loaded via `.env` and `next.config.ts`.
- **API Layer (`src/api`)**: Comprehensive API functions (`authApi.ts`, `userApi.ts`, `serviceApi.ts`, `orderApi.ts`, `transactionApi.ts`, `addFundApi.ts`) are implemented for all core entities, providing a clean interface for data interaction.
- **Type Definitions (`src/types`)**: Strong TypeScript typings are established for all data models (User, Service, Order, Transaction, Wallet, DashboardStats), ensuring type safety throughout the application.
- **React Query Hooks (`src/hooks`)**: Custom hooks (`useUsers.ts`, `useServices.ts`, `useOrders.ts`, `useTransactions.ts`, `useWallet.ts`) are implemented for efficient data fetching, caching, and mutation management, leveraging TanStack Query.
- **Authentication Context (`src/contexts/AuthProvider.tsx`)**: A global authentication provider manages user sessions, login, and logout, making user information accessible across the application.

### 2. Admin Panel Implementation (`src/app/admin`):
- **Dashboard (`/admin/dashboard`)**: Provides an overview with key statistics (new users, active services, pending orders, revenue) using `DashboardCard` components. Includes placeholders for recent activities.
- **User Management (`/admin/users`)**: Implements full CRUD (Create, Read, Update, Delete) operations for user accounts. Features include:
  - User listing with search and status filtering.
  - Modals for adding and editing user details using `UserForm`.
  - Integration with `authApi.register` for new user creation (note: a known bug exists where new user registration might fail due to database constraints, which is being tracked for future resolution).
- **Service Management (`/admin/services`)**: Implements full CRUD operations for service offerings. Features include:
  - Service listing using `ServiceCard` components.
  - Modals for adding and editing service details using `ServiceForm`.
- **Order Management (`/admin/orders`)**: Implements full CRUD operations for customer orders. Features include:
  - Order listing with search and status filtering.
  - Modals for adding and editing order details using `OrderForm`.
- **Transaction Management (`/admin/transactions`)**: Implements full CRUD operations for financial transactions. Features include:
  - Transaction listing with search, type, and status filtering.
  - Modals for adding and editing transaction details using `TransactionForm`.
- **AI Tools (`/admin/ai-tools`)**: Integrates the `ServiceOptimizer` component, demonstrating an AI-powered tool for enhancing service descriptions.

### 3. Routing & UI Structure:
- **Next.js App Router**: Utilizes Next.js 14+ App Router for routing, with route groups (`admin`, `auth`) for logical organization.
- **Client Components**: Pages and components requiring React hooks (e.g., `useState`, `useRouter`, `useQuery`) are explicitly marked with `'use client'` directive to ensure proper client-side rendering.
- **Shared UI Components (`src/components/ui`, `src/components/shared`)**: Reusable UI components from `shadcn/ui` and custom shared components (`DataTable`, `LoadingSpinner`, `AdminSidebar`, `DashboardCard`, `Header`) are used for a consistent and minimalist design.

### 4. Known Issues & Next Steps:
- **Login Button Stuck (Potential Browser Cache Issue)**: During development, the login button might appear stuck after a successful authentication request (200 OK in network tab), with no further console output. This behavior is highly unusual and suggests a client-side issue, potentially related to browser caching or extensions interfering with JavaScript execution. A hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or clearing browser cache/cookies often resolves this. This is noted as a potential intermittent development-time issue.
- **User Registration Bug**: New user registration via the admin panel currently fails due to persistent database errors related to foreign key constraints on the `wallets` table. This is likely caused by Supabase's internal transaction handling and the order of operations between `auth.users` creation and subsequent database trigger execution. Attempts to resolve this with database triggers have been unsuccessful due to the nature of the error (transaction abortion before wallet insertion). The recommended solution is to implement a Post-Confirmation Edge Function to handle user profile and wallet creation, but this requires a clean Supabase project setup to avoid conflicts with existing, problematic database functions/triggers. This bug is noted and will be addressed in a future iteration, likely requiring a fresh Supabase project.
- **Data Filtering**: While filter states are implemented in the UI, the API calls for filtering users, orders, and transactions are currently basic and will require further refinement to fully leverage Supabase query capabilities.
- **Comprehensive Testing**: Further unit and integration tests are needed to ensure the robustness and reliability of all CRUD operations and data flows.

This blueprint will be continuously updated as the project evolves.