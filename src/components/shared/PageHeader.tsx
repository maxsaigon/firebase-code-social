type PageHeaderProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
