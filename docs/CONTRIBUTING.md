## UI/UX Design System - "Simple is the Best"

### Core Design Principles

1.  **Minimalist Interface**

    ```typescript
    // ✅ Good: Clean, focused interface
    const UserCard = ({ user }: { user: User }) => (
      <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{user.full_name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    );

    // ❌ Avoid: Cluttered, over-designed interfaces
    ```

2.  **Consistent Color Palette**

    ```css
    /* Primary Colors - Use sparingly for actions */
    --primary: 222.2 84% 4.9%;          /* Almost black */
    --primary-foreground: 210 40% 98%;  /* White text */

    /* Secondary Colors - For less important elements */
    --secondary: 210 40% 96%;           /* Light gray */
    --secondary-foreground: 222.2 84% 4.9%;

    /* Semantic Colors */
    --success: 142 76% 36%;             /* Green for success */
    --warning: 38 92% 50%;              /* Yellow for warnings */
    --destructive: 0 72% 51%;           /* Red for errors */

    /* Neutral Colors - Primary usage */
    --background: 0 0% 100%;            /* White background */
    --foreground: 222.2 84% 4.9%;       /* Dark text */
    --muted: 210 40% 96%;               /* Light gray */
    --border: 214.3 31.8% 91.4%;       /* Border gray */
    ```

3.  **Typography Hierarchy**

    ```typescript
    const TypographyGuide = {
      // Page titles
      h1: "text-3xl font-bold tracking-tight",
      
      // Section titles
      h2: "text-2xl font-semibold",
      
      // Subsection titles
      h3: "text-lg font-medium",
      
      // Body text
      body: "text-sm text-gray-600",
      
      // Small text
      small: "text-xs text-gray-500",
      
      // Interactive elements
      button: "text-sm font-medium",
      
      // Form labels
      label: "text-sm font-medium text-gray-700"
    };
    ```

4.  **Spacing System**

    ```typescript
    // Use consistent spacing scale
    const spacing = {
      xs: "p-2",      // 8px
      sm: "p-4",      // 16px
      md: "p-6",      // 24px
      lg: "p-8",      // 32px
      xl: "p-12",     // 48px
    };

    // Gap system for layouts
    const gaps = {
      xs: "gap-2",    // 8px
      sm: "gap-4",    // 16px
      md: "gap-6",    // 24px
      lg: "gap-8",    // 32px
    };
    ```

### Component Design Patterns

1.  **Dashboard Cards**

    ```typescript
    interface DashboardCardProps {
      title: string;
      value: string | number;
      icon?: React.ElementType;
      trend?: {
        value: number;
        isPositive: boolean;
      };
    }

    const DashboardCard = ({ title, value, icon: Icon, trend }: DashboardCardProps) => (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          {Icon && (
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
          </div>
        )}
      </div>
    );
    ```

2.  **Data Tables**

    ```typescript
    // Simple, clean table design
    const DataTable = ({ data, columns }: DataTableProps) => (
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
    ```

3.  **Forms**

    ```typescript
    // Clean, accessible form design
    const FormField = ({ label, error, children }: FormFieldProps) => (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {children}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );

    const Input = ({ className, ...props }: InputProps) => (
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
    ```

4.  **Buttons**

    ```typescript
    // Button variants following simple design
    const Button = ({ variant = "primary", size = "md", children, ...props }: ButtonProps) => {
      const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
      
      const variants = {
        primary: "bg-black text-white hover:bg-gray-800 focus:ring-black",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
      };
      
      const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
      };
      
      return (
        <button
          className={cn(baseStyles, variants[variant], sizes[size])}
          {...props}
        >
          {children}
        </button>
      );
    };
    ```

5.  **Navigation**

    ```typescript
    // Simple sidebar navigation
    const SidebarItem = ({ icon: Icon, label, href, isActive }: SidebarItemProps) => (
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
          isActive 
            ? "bg-gray-900 text-white" 
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    );
    ```

### Responsive Design Guidelines

1.  **Mobile-First Approach**

    ```typescript
    // Always start with mobile design
    const ResponsiveLayout = () => (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile: Stack vertically */}
        <div className="lg:hidden">
          <MobileHeader />
          <main className="p-4">
            <MobileContent />
          </main>
        </div>
        
        {/* Desktop: Sidebar + Main */}
        <div className="hidden lg:flex">
          <aside className="w-64 bg-white border-r">
            <Sidebar />
          </aside>
          <main className="flex-1 p-8">
            <DesktopContent />
          </main>
        </div>
      </div>
    );
    ```

2.  **Breakpoint System**

    ```typescript
    // Consistent breakpoints
    const breakpoints = {
      sm: "640px",   // Mobile large
      md: "768px",   // Tablet
      lg: "1024px",  // Desktop
      xl: "1280px",  // Desktop large
    };

    // Usage in components
    const GridLayout = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Cards */}
      </div>
    );
    ```

## 🔧 Implementation Guidelines

### 1. File Structure Setup

```typescript
// When creating new files, follow this pattern:

// 1. Imports (grouped)
import React from 'react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Types
interface ComponentProps {
  // Define props here
}

// 3. Component
export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // 4. State and hooks
  const [state, setState] = useState();
  
  // 5. Effects
  useEffect(() => {
    // Effects here
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### 2. API Integration Pattern

```typescript
// API functions structure
// File: src/api/userApi.ts
import { supabase } from '@/lib/supabaseClient';
import type { User, CreateUserData } from '@/types';

export const userApi = {
  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Delete user
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
```

### 3. React Query Integration

```typescript
// Custom hooks for data fetching
// File: src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import { toast } from '@/hooks/use-toast';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
```

### 4. Form Handling Pattern

```typescript
// Form component with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['active', 'inactive', 'suspended']),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserForm = ({ user, onSubmit }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Full Name" error={errors.full_name?.message}>
        <Input {...register('full_name')} />
      </FormField>
      
      <FormField label="Email" error={errors.email?.message}>
        <Input type="email" {...register('email')} />
      </FormField>
      
      <FormField label="Status" error={errors.status?.message}>
        <Select {...register('status')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </Select>
      </FormField>
      
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
```

### 5. Error Handling

```typescript
// Global error boundary
export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundaryProvider
      fallback={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg border text-center max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {error.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={resetErrorBoundary}>
              Try again
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundaryProvider>
  );
};

// API error handling
export const handleApiError = (error: any) => {
  if (error.code === 'PGRST116') {
    return 'No data found';
  }
  if (error.code === 'PGRST301') {
    return 'Unauthorized access';
  }
  return error.message || 'An error occurred';
};
```

## 📱 Page Implementation Guidelines

### 1. Admin Dashboard (ControlCenter)

```typescript
// Clean, focused dashboard
export const ControlCenter = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => supabase.from('dashboard_stats').select('*').single(),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your service hub</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="New Users"
          value={stats.new_users_30d}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Active Services"
          value={stats.active_services}
          icon={Package}
        />
        <DashboardCard
          title="Pending Orders"
          value={stats.pending_orders}
          icon={Clock}
        />
        <DashboardCard
          title="Revenue (30d)"
          value={`$${stats.revenue_30d}`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <RecentUsers />
      </div>
    </div>
  );
};
```

### 2. User Management Page

```typescript
// Simple user management with filters
export const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);
  
  const { data: users, isLoading } = useUsers({
    search: debouncedSearch,
    status: statusFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>
      
      {/* User Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          data={users}
          columns={[
            {
              key: 'full_name',
              header: 'Name',
              render: (value, user) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{value}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (value) => (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  value === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : value === 'inactive'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {value}
                </span>
              ),
            },
            {
              key: 'created_at',
              header: 'Joined',
              render: (value) => new Date(value).toLocaleDateString(),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (_, user) => (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
};
```

### 3. Service Management Page

```typescript
// Service management with modal creation
export const ServiceManager = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: services, isLoading } = useServices();
  const createService = useCreateService();

  const handleCreateService = async (data: CreateServiceData) => {
    try {
      await createService.mutateAsync(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
      
      {/* Create Service Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
          </DialogHeader>
          <ServiceForm onSubmit={handleCreateService} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

## 🔐 Authentication & Security

### 1. Auth Provider Setup

```typescript
// Authentication context
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: (email: string, password: string) => 
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Protected Routes

```typescript
// Route protection component
export const ProtectedRoute = ({
  children,
  requireAdmin = false
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, loading } = useAuth();
  const { data: profile } = useUser(user?.id);

  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requireAdmin && !profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
