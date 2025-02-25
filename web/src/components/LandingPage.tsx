import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-primary/5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Track Your Skincare Journey
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Discover what works best for your skin by tracking products, routines, and results.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-[400px]:flex-row">
              <Link to="/login">
                <Button size="lg" className="px-8">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[50%] top-0 h-[500px] w-[500px] -translate-x-[50%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Features
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                Everything you need to track your skincare routine and see results
              </p>
            </div>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-10 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                  <rect x="9" y="3" width="6" height="4" rx="2"></rect>
                  <path d="M9 14h.01"></path>
                  <path d="M13 14h.01"></path>
                  <path d="M9 18h.01"></path>
                  <path d="M13 18h.01"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Product Tracking</h3>
              <p className="text-center text-muted-foreground">
                Log all your skincare products and when you use them
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Daily Routines</h3>
              <p className="text-center text-muted-foreground">
                Create morning and evening routines to stay consistent
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Progress Tracking</h3>
              <p className="text-center text-muted-foreground">
                Monitor how your skin responds to different products over time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                Start tracking your skincare journey in three simple steps
              </p>
            </div>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-10 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Add Products</h3>
              <p className="text-center text-muted-foreground">
                Enter the skincare products you use regularly
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">Log Routines</h3>
              <p className="text-center text-muted-foreground">
                Record which products you use each day
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Track Results</h3>
              <p className="text-center text-muted-foreground">
                See which products and routines work best for your skin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Ready to start your skincare journey?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                Create an account and begin tracking your skincare routine today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-[400px]:flex-row">
              <Link to="/login">
                <Button size="lg" className="px-8">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 