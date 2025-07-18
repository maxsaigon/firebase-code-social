import type { Service, CreateServiceData } from '@/types';

export const serviceApi = {
  async getServices(): Promise<Service[]> {
    const response = await fetch('/api/services');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch services');
    }
    
    return result.data;
  },

  async getServiceById(id: string): Promise<Service> {
    const response = await fetch(`/api/services/${id}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch service');
    }
    
    return result.data;
  },

  async createService(serviceData: CreateServiceData): Promise<Service> {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create service');
    }
    
    return result.data;
  },

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    const response = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update service');
    }
    
    return result.data;
  },

  async deleteService(id: string): Promise<void> {
    const response = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete service');
    }
  },
};