import Image from 'next/image';
import type { Service } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.category}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem className='text-destructive'>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video w-full">
          <Image
            src={service.image_url!}
            alt={service.name}
            fill
            className="rounded-md object-cover"
            data-ai-hint="digital service business"
          />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {service.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xl font-bold">${service.price}</div>
        <Badge variant={service.is_active ? 'default' : 'outline'}>
          {service.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </CardFooter>
    </Card>
  );
}
