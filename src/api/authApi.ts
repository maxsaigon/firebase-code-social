export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  status: string;
}

export const authApi = {
  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; message: string }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },

  // Register user
  async register(userData: RegisterData): Promise<{ user: User; message: string }> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },

  // Logout user
  async logout(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user || null;
    } catch {
      return null;
    }
  },
};
