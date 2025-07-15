'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  LifeBuoy,
  LogOut,
  Cog,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared/icons';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/services', icon: Package, label: 'Services' },
  { href: '/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
];

const secondaryNavItems = [
    { href: '/settings', icon: Cog, label: 'Settings' },
    { href: '/support', icon: LifeBuoy, label: 'Support' },
]

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex h-16 items-center border-b px-6 shrink-0">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="">Service Central</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto flex flex-col gap-1 p-4">
        {secondaryNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="w-full justify-start">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                </Button>
            </Link>
        ))}
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
