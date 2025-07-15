'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Package, ShoppingCart, DollarSign, Sparkles } from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, isActive }: SidebarItemProps) => (
  <Link
    href={href}
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

const AdminSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: Users,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: Package,
      label: "Services",
      href: "/admin/services",
    },
    {
      icon: ShoppingCart,
      label: "Orders",
      href: "/admin/orders",
    },
    {
      icon: DollarSign,
      label: "Transactions",
      href: "/admin/transactions",
    },
    {
      icon: Sparkles,
      label: "AI Tools",
      href: "/admin/ai-tools",
    },
  ];

  return (
    <div className="flex flex-col h-full px-3 py-4 overflow-y-auto bg-white border-r">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Service Central</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;