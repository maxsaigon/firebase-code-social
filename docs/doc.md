# Social Service Hub Documentation

## Table of Contents
1. [Overview](#1-overview)
2. [Folder Structure & File-by-File Breakdown](#2-folder-structure--file-by-file-breakdown)
3. [Main Features](#3-main-features)
4. [How to Use](#4-how-to-use)
5. [Notes](#5-notes)
6. [Supabase Schema and Row Level Security (RLS)](#6-supabase-schema-and-row-level-security-rls)
7. [Contributing Guidelines](#7-contributing-guidelines)

## 1. Overview

Social Service Hub is a comprehensive, modern admin dashboard built with React, Vite, TypeScript, and Supabase. It provides a robust interface for managing users, services, orders, and transactions, with features like CRUD operations, data filtering and sorting, real-time analytics, and a responsive, mobile-friendly UI.

**Key Technologies:**

*   **Frontend:** React, Vite, TypeScript
*   **Backend & Database:** Supabase
*   **UI Components:** shadcn/ui, Tailwind CSS
*   **Routing:** React Router DOM
*   **State Management:** TanStack Query
*   **Forms:** React Hook Form

---

## 2. Folder Structure & File-by-File Breakdown

This section provides a detailed breakdown of the project's structure and the purpose of each file.

### 2.1. `/` (Root Directory)

*   **`vite.config.ts`**: Vite configuration file. Sets up the development server, plugins (including React and a component tagger for development), and path aliases.
*   **`package.json`**: Defines project metadata, dependencies, and scripts.
*   **`tsconfig.json`**: TypeScript compiler options, including path aliases for cleaner imports.
*   **`tailwind.config.ts`**: Tailwind CSS configuration, including theme customizations and plugins.
*   **`postcss.config.js`**: PostCSS configuration for processing CSS.
*   **`index.html`**: The main HTML entry point for the application.
*   **`README.md`**: General information about the project.
*   **`doc.md`**: This documentation file.

### 2.2. `/src`

This directory contains the core source code of the application.

#### 2.2.1. `/api`

Contains all API functions for interacting with the Supabase backend.

*   **`authApi.ts`**: Handles authentication-related functions:
    *   `login(email, password)`: Signs in a user with email and password.
    *   `register(email, password)`: Creates a new user.
    *   `logout()`: Signs out the current user.
*   **`userApi.ts`**: Manages user-related data.
*   **`orderApi.ts`**: Manages order-related data.
*   **`serviceApi.ts`**: Manages service-related data.
*   **`transactionApi.ts`**: Manages transaction-related data.
*   **`addFundApi.ts`**: Handles wallet and fund management.

#### 2.2.2. `/components`

Contains reusable UI components.

*   **`/shared`**:
    *   **`AdminSidebar.tsx`**: The main sidebar navigation for the admin layout.
    *   **`DashboardCard.tsx`**: A card component used to display statistics on the admin dashboard.
    *   **`LoadingSpinner.tsx`**: A loading spinner component.
    *   **`NavBar.tsx`**: The main navigation bar.
    *   **`ProtectedRoute.tsx`**: A component to protect routes that require authentication.
*   **`/ui`**: Contains [shadcn/ui](https://ui.shadcn.com/) primitive components, which are reusable, accessible, and customizable UI primitives. These are mostly third-party, but can be customized as needed.

#### 2.2.3. `/contexts`

*   **`AuthProvider.tsx`**: A React context provider that manages the application's authentication state, making user information available to all components that need it.

#### 2.2.4. `/hooks`

Contains custom React hooks for shared logic.

*   **`useAuth.ts`**: A hook that provides easy access to the authentication context (e.g., user data, login/logout functions).
*   **`useDebounce.ts`**: A hook to debounce input, useful for delaying API calls in search and filter inputs.
*   **`use-mobile.tsx`**: A hook to detect if the application is being viewed on a mobile device, allowing for responsive UI adjustments.
*   **`use-toast.ts`**: A hook for displaying toast notifications.

#### 2.2.5. `/layouts`

*   **`AdminLayout.tsx`**: The main layout for all admin pages, typically including the `AdminSidebar` and a content area.
*   **`MainLayout.tsx`**: The layout for public-facing or user-specific pages.

#### 2.2.6. `/lib`

*   **`supabaseClient.ts`**: Initializes and exports the Supabase client, making it available for use throughout the application. It reads the Supabase URL and anon key from environment variables.
*   **`utils.ts`**: Contains utility functions used across the application, such as `cn` for merging Tailwind CSS classes.

#### 2.2.7. `/pages`

Contains the main pages of the application.

*   **`/admin`**:
    *   **`ControlCenter.tsx`**: The main admin dashboard, displaying key statistics like new members, popular services, and recent orders.
    *   **`UserManagement.tsx`**: A page for managing users (listing, searching, filtering, and viewing details).
    *   **`UserDetail.tsx`**: A page displaying detailed information about a specific user.
    *   **`OrderManager.tsx`**: A page for managing orders.
    *   **`OrderDetail.tsx`**: A page displaying detailed information about a specific order.
    *   **`ServiceManager.tsx`**: A page for managing services.
    *   **`TransactionManager.tsx`**: A page for managing transactions.
*   **`/auth`**:
    *   **`LoginPage.tsx`**: The login page.
    *   **`RegisterPage.tsx`**: The user registration page.
*   **`/user`**:
    *   **`HomePage.tsx`**: The user's home page. Displays all available services; users can place orders.
    *   **`MyOrdersPage.tsx`**: A page where users can view their own orders.
    *   **`OrderServicePage.tsx`**: A page for ordering new services.
    *   **`TransactionPage.tsx`**: A page where users can view their transactions.
    *   **`WalletPage.tsx`**: A page for managing the user's wallet.
*   **`NotFoundPage.tsx`**: A 404 page for handling invalid routes.

#### 2.2.8. `/types`

*   **`index.ts`**: Contains all TypeScript type definitions for the application's data structures, such as `User`, `Order`, `Service`, and `Transaction`.

### 2.3. Main Application Files

*   **`main.tsx`**: The entry point of the React application. It renders the `App` component into the DOM.
*   **`App.tsx`**: The root component of the application. It sets up the main providers (`QueryClientProvider`, `TooltipProvider`, `AuthProvider`), defines the application's routes using `react-router-dom`, and includes the global `Toaster` components for notifications.
*   **`index.css`**: Global CSS styles for the application.

---

## 3. Main Features

*   **User Management**: Full CRUD operations for users, including status management, detailed views, and powerful search and filtering capabilities.
*   **Service Management**: Comprehensive CRUD for services, with support for pagination, status toggles, and a modal-based UX for creating and editing.
*   **Order Management**: Detailed order tracking, status workflows (e.g., pending, completed, cancelled), and refund logic.
*   **Transaction Management**: A complete record of all financial transactions, with detailed views and pagination.
*   **Admin Dashboard**: A central hub for administrators, providing at-a-glance statistics and insights into the platform's activity.
*   **Authentication**: Secure login and registration, with protected routes to ensure only authorized users can access the admin panel.
*   **Supabase Integration**: All data operations are handled through Supabase, providing a scalable and reliable backend.
*   **Responsive UI**: The application is designed to be fully responsive and accessible on both desktop and mobile devices.

---

## 4. How to Use

1.  **Clone the repository** and navigate to the project directory.
2.  **Install dependencies**: Run `npm install` or `bun install`.
3.  **Set up Supabase**: 
    *   Refer to the [Supabase Schema and RLS documentation](./supabase/schema.sql) for detailed setup instructions.
    *   Create a `.env` file in the root of the project.
    *   Add your Supabase URL and Anon Key to the `.env` file:
        ```
        VITE_SUPABASE_URL=your-supabase-url
        VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```
    *   _Other required environment variables:_ 
        - (Add any additional variables here as your project grows)
        - Example: `VITE_API_BASE_URL`, `VITE_FEATURE_FLAG_X`, etc.
4.  **Start the development server**: Run `npm run dev`.
5.  **Access the application**: Open your browser and navigate to `http://localhost:8080`. The admin dashboard is available at `/admin`.

---

## 5. Notes

*   All CRUD and workflow logic is handled via the Supabase API, ensuring a single source of truth for all data.
*   Each admin page is designed to be modular and can be easily extended with new features.
*   The transaction and order logic supports linking and refund workflows, providing a robust audit trail.

For further details, please refer to the comments within each file or contact the project maintainer.

---

## 6. Supabase Schema and Row Level Security (RLS)

For detailed information on the Supabase database schema, Row Level Security (RLS) policies, functions, triggers, and helper views, please refer to the dedicated schema file:

*   [Supabase Schema and RLS Documentation](./supabase/schema.sql)

For sample data to populate your Supabase tables, refer to:

*   [Supabase Sample Data](./supabase/seed.sql)

---

## 7. Contributing Guidelines

For UI/UX design principles, component design patterns, implementation guidelines, and page-specific implementation details, please refer to the contributing guidelines:

*   [Contributing Guidelines](./CONTRIBUTING.md)