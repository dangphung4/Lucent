import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar } from './ui/avatar';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [greeting, setGreeting] = useState('Hello');
  
  // Get first name from email or use "there" as fallback
  const firstName = currentUser?.email?.split('@')[0] || 'there';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-8">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/80 via-primary to-primary/90 pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.1))]"></div>
        
        <div className="container max-w-7xl mx-auto px-4">
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {greeting}, {displayName}!
              </h1>
              <p className="text-primary-foreground/90 max-w-xl">
                Track your skincare routine, monitor progress, and discover what works best for your skin.
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Button variant="secondary" size="sm" className="rounded-full text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </Button>
              <Avatar className="h-10 w-10 border-2 border-white">
                <div className="flex h-full w-full items-center justify-center bg-primary-foreground text-primary font-medium">
                  {displayName.charAt(0)}
                </div>
              </Avatar>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full">
            <path fill="hsl(var(--background))" fillOpacity="1" d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 -mt-6 md:-mt-10 relative z-10">
        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="bg-card rounded-xl shadow-lg border p-1 mb-8">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overview
              </TabsTrigger>
              <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Products
              </TabsTrigger>
              <TabsTrigger value="routines" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Routines
              </TabsTrigger>
              <TabsTrigger value="progress" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Progress
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="mt-0">
            {/* Overview Tab Content */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Products</span>
                      <span className="text-3xl font-bold mt-1">0</span>
                      <span className="text-muted-foreground text-xs mt-1">No products added yet</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">Routines</span>
                      <span className="text-3xl font-bold mt-1">0</span>
                      <span className="text-muted-foreground text-xs mt-1">No routines logged yet</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">Streak</span>
                      <span className="text-3xl font-bold mt-1">0</span>
                      <span className="text-muted-foreground text-xs mt-1">Days in a row</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">Progress</span>
                      <span className="text-3xl font-bold mt-1">0</span>
                      <span className="text-muted-foreground text-xs mt-1">Photos tracked</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 border-blue-200 dark:border-blue-800/40">
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
                      <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                        Add Product
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 border-purple-200 dark:border-purple-800/40">
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
                      <Button className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-white">
                        Log Today's Routine
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 border-green-200 dark:border-green-800/40">
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
                      <Button className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white">
                        View Progress
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-6 space-y-6">
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
              </div>
              
              {/* Tips & Recommendations */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Tips & Recommendations</h2>
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4"></path>
                          <path d="M12 16h.01"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Consistency is Key</h3>
                        <p className="text-muted-foreground">
                          For best results, stick to your skincare routine consistently. Track your daily routines to build healthy habits and see better results over time.
                        </p>
                        <Button variant="link" className="p-0 h-auto mt-2 text-primary font-medium">
                          Learn more about building routines
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="mt-0">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                  <rect x="9" y="3" width="6" height="4" rx="2"></rect>
                  <path d="M9 14h.01"></path>
                  <path d="M13 14h.01"></path>
                  <path d="M9 18h.01"></path>
                  <path d="M13 18h.01"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">No Products Yet</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Start building your skincare collection by adding the products you use regularly.
              </p>
              <Button size="lg" className="rounded-full">
                Add Your First Product
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="routines" className="mt-0">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">No Routines Yet</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Create your morning and evening skincare routines to track your daily habits.
              </p>
              <Button size="lg" className="rounded-full">
                Create Your First Routine
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-0">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">No Progress Tracked</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Take photos and track your skin's progress over time to see what works best.
              </p>
              <Button size="lg" className="rounded-full">
                Track Your First Progress Photo
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add the CSS for the grid pattern */}
      <style>
        {`
          .bg-grid-pattern {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
          }
        `}
      </style>
    </div>
  );
} 