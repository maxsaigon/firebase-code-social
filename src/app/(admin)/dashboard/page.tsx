import {
  getDashboardStats,
  getRecentOrders,
  getRecentUsers,
} from '@/lib/data';
import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardCard } from '@/components/shared/DashboardCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import type { Order, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentOrders = await getRecentOrders();
  const recentUsers = await getRecentUsers();

  return (
    <div className="flex flex-col gap-8 py-8">
      <PageHeader
        title="Dashboard"
        description="An overview of your service hub's performance."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Revenue (30d)"
          value={`$${stats.revenue30d.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="New Users (30d)"
          value={`+${stats.newUsers30d}`}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={ShoppingCart}
          trend={{ value: 5, isPositive: false }}
        />
        <DashboardCard
          title="Active Services"
          value={stats.activeServices}
          icon={Package}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>An overview of the most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={recentOrders} />
          </CardContent>
        </Card>
        <RecentUsers users={recentUsers} />
      </div>
    </div>
  );
}

function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <div className="font-medium">{order.user?.full_name}</div>
              <div className="text-sm text-muted-foreground">{order.user?.email}</div>
            </TableCell>
            <TableCell>{order.service?.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{order.status}</Badge>
            </TableCell>
            <TableCell className="text-right">${order.total_amount.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RecentUsers({ users }: { users: User[] }) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Users who joined recently.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar_url} alt={user.full_name} />
              <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
