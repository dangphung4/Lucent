import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get first name from email or use "there" as fallback
  const firstName = currentUser?.email?.split('@')[0] || 'there';
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/80 via-primary to-primary/90 p-8 mb-8 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.1))]"></div>
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Hello, {firstName.charAt(0).toUpperCase() + firstName.slice(1)}!
          </h1>
          <p className="text-primary-foreground/90 max-w-xl">
            Track your skincare routine, monitor progress, and discover what works best for your skin. Your personalized skincare journey starts here.
          </p>
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'outline'} 
            size="sm"
            className="rounded-full"
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={activeTab === 'products' ? 'default' : 'outline'} 
            size="sm"
            className="rounded-full"
            onClick={() => setActiveTab('products')}
          >
            Products
          </Button>
          <Button 
            variant={activeTab === 'routines' ? 'default' : 'outline'} 
            size="sm"
            className="rounded-full"
            onClick={() => setActiveTab('routines')}
          >
            Routines
          </Button>
          <Button 
            variant={activeTab === 'progress' ? 'default' : 'outline'} 
            size="sm"
            className="rounded-full"
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">Track Products</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                  <rect x="9" y="3" width="6" height="4" rx="2"></rect>
                  <path d="M9 14h.01"></path>
                  <path d="M13 14h.01"></path>
                  <path d="M9 18h.01"></path>
                  <path d="M13 18h.01"></path>
                </svg>
              </div>
            </div>
            <CardDescription>
              Log your skincare products and track when you use them
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-4">
            <Button className="w-full rounded-full group-hover:bg-blue-600 transition-colors">
              Add Product
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">Daily Routine</CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
            <CardDescription>
              Record your morning and evening skincare routines
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-4">
            <Button className="w-full rounded-full group-hover:bg-purple-600 transition-colors">
              Log Today's Routine
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/5 pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">Track Progress</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
            </div>
            <CardDescription>
              Monitor your skin's progress and see what works
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-4">
            <Button className="w-full rounded-full group-hover:bg-green-600 transition-colors">
              View Progress
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest skincare activities and reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Button variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
              Log Now
            </Button>
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
            <Button variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
              Add Products
            </Button>
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
            <Button variant="outline" size="sm" className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
              Track Progress
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* CSS for background grid pattern */}
      <style jsx>{`
        .bg-grid-white\/10 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </div>
  );
} 