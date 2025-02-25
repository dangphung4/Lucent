// currently not used, probably deprecated will delete later

import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';

export function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to Skincare Track</h1>
        <p className="text-muted-foreground">
          Track your skincare routine and see what works best for you
        </p>
        {currentUser && (
          <div className="mt-4">
            <Button onClick={handleNavigateToDashboard} className="bg-primary hover:bg-primary/90">
              Go to Dashboard
            </Button>
          </div>
        )}
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
            {currentUser ? (
              <Button className="w-full" onClick={() => navigate('/dashboard?tab=products')}>
                Add Product
              </Button>
            ) : (
              <Link to="/login">
                <Button className="w-full">
                  Add Product
                </Button>
              </Link>
            )}
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
            {currentUser ? (
              <Button className="w-full" onClick={() => navigate('/dashboard?tab=routines')}>
                Log Today's Routine
              </Button>
            ) : (
              <Link to="/login">
                <Button className="w-full">
                  Log Today's Routine
                </Button>
              </Link>
            )}
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
            {currentUser ? (
              <Button className="w-full" onClick={() => navigate('/dashboard?tab=progress')}>
                View Progress
              </Button>
            ) : (
              <Link to="/login">
                <Button className="w-full">
                  View Progress
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Only show Getting Started section for non-logged in users */}
      {!currentUser && (
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
      )}

      {/* For logged in users, show a summary section instead */}
      {currentUser && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Your Skincare Journey</h3>
          <p className="text-muted-foreground mb-4">
            Continue your skincare journey by tracking products, logging routines, and monitoring progress.
          </p>
          <Button 
            onClick={handleNavigateToDashboard} 
            className="bg-primary hover:bg-primary/90"
          >
            Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
} 