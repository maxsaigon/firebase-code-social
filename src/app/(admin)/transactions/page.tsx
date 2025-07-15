import { getTransactions } from '@/lib/data';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { File, MoreHorizontal } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';

export default async function TransactionManagementPage() {
  const transactions = await getTransactions();

  const statusVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline'
    }
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      <PageHeader
        title="Transaction History"
        description="Track all financial transactions in the system."
      >
        <Button variant="outline">
          <File className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>A list of all recent transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="font-medium">{tx.user?.full_name}</div>
                    <div className="text-sm text-muted-foreground">{tx.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{tx.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(tx.status)} className="capitalize">{tx.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(tx.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className={cn("text-right font-mono", tx.amount > 0 ? "text-success" : "text-destructive")}>
                    {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
