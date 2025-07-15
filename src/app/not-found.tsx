import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-semibold text-foreground">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Go back home</Link>
      </Button>
    </div>
  )
}
