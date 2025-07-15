import { getServices } from '@/lib/data';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import { ServiceOptimizer } from '@/components/service-optimizer';

export default async function ServiceManagementPage() {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-8 py-8">
      <PageHeader
        title="Service Management"
        description="Manage your service offerings and optimize descriptions."
      >
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <div className="lg:col-span-1">
          <ServiceOptimizer />
        </div>
      </div>
    </div>
  );
}
