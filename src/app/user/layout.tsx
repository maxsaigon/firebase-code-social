'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'Home', href: '/user' },
    { label: 'My Orders', href: '/user/my-orders' },
    { label: 'My Transactions', href: '/user/transactions' },
    { label: 'My Wallet', href: '/user/wallet' },
    { label: 'Order Service', href: '/user/order-service' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Service Central</h1>
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hover:text-gray-300',
                  pathname === item.href ? 'font-bold' : ''
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-gray-700">
              Logout
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-1 container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2024 Service Central</p>
      </footer>
    </div>
  );
}