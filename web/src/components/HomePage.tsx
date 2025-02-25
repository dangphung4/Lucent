import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';

export function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to Skincare Track</h1>
        <p className="text-muted-foreground">
          Track your skincare routine and see what works best for you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-semibold">Track Products</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Log your skincare products and track when you use them
            </p>
          </div>
          <div className="mt-4">
            <Button className="w-full">
              Add Product
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-semibold">Daily Routine</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Record your daily skincare routine
            </p>
          </div>
          <div className="mt-4">
            <Button className="w-full">
              Log Today's Routine
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-semibold">Track Progress</h3>
            <p className="text-sm text-muted-foreground flex-1">
              Monitor your skin's progress over time
            </p>
          </div>
          <div className="mt-4">
            <Button className="w-full">
              View Progress
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <div>
              <h4 className="text-lg font-medium">Add your skincare products</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Start by adding the skincare products you use regularly
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <div>
              <h4 className="text-lg font-medium">Log your daily routine</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Record which products you use each day
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <div>
              <h4 className="text-lg font-medium">Track your progress</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor how your skin responds to different products over time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 