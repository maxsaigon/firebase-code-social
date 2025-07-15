import { AdminSidebar } from '@/components/shared/AdminSidebar';
import { Header } from '@/components/shared/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <AdminSidebar />
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
