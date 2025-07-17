import React from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex min-h-screen bg-gray-100">
        <aside className="w-64 bg-white shadow-md">
          <AdminSidebar />
        </aside>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}