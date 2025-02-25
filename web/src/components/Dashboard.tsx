import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';

export function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="container py-6 space-y-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome, {currentUser?.email?.split('@')[0]}</h1>
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
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <h4 className="text-base font-medium">Morning Routine</h4>
                <p className="text-sm text-muted-foreground">
                  You haven't logged your morning routine today
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">Log Now</Button>
          </div>
          
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                  <rect x="9" y="3" width="6" height="4" rx="2"></rect>
                  <path d="M9 14h.01"></path>
                  <path d="M13 14h.01"></path>
                  <path d="M9 18h.01"></path>
                  <path d="M13 18h.01"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-base font-medium">Product Inventory</h4>
                <p className="text-sm text-muted-foreground">
                  You haven't added any products yet
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">Add Products</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-base font-medium">Progress Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Start tracking your progress to see results
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">Track Progress</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 