import { getUsers } from '@/lib/data';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, File, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { User } from '@/types';

export default async function UserManagementPage() {
  const users = await getUsers();

  const statusVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
    }
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      <PageHeader
        title="User Management"
        description="Manage all user accounts and permissions."
      >
        <div className="flex gap-2">
          <Button variant="outline">
            <File className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'MMMM d, yyyy')}
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
                        <DropdownMenuItem><Pencil className="h-4 w-4 mr-2"/>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2"/>Delete</DropdownMenuItem>
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
