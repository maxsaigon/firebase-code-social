import { User, CreateUserData } from '@/types';

const API_BASE = '/api';

export const userApi = {
  // Get all users
  async getUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  // Create user
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }
    
    return response.json();
  },

  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }
    
    return response.json();
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }
  },
};
