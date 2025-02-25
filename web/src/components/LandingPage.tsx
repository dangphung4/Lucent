import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Your Skincare Journey, Tracked
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                Discover what works best for your skin by tracking products, routines, and results in one beautiful app.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 min-[400px]:flex-row">
              <Link to="/login">
                <Button size="lg" className="px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* App Preview Image */}
            <div className="relative w-full max-w-4xl mt-8 md:mt-16">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-3xl -z-10 transform scale-110"></div>
              <div className="relative bg-card border rounded-2xl shadow-xl overflow-hidden dark:border-gray-800">
                <div className="aspect-[16/9] md:aspect-[21/9] w-full bg-gradient-to-br from-primary/5 to-background p-4 md:p-8 dark:from-primary/10 dark:to-background">
                  <div className="h-full w-full rounded-lg bg-card border shadow-sm flex flex-col dark:bg-gray-900 dark:border-gray-800">
                    <div className="border-b p-4 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <div className="ml-4 h-6 w-64 rounded-md bg-muted dark:bg-gray-800"></div>
                      </div>
                    </div>
                    <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-2 flex flex-col gap-4">
                        <div className="h-8 w-48 rounded-md bg-muted dark:bg-gray-800"></div>
                        <div className="h-24 w-full rounded-md bg-muted dark:bg-gray-800"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-32 rounded-md bg-muted dark:bg-gray-800"></div>
                          <div className="h-32 rounded-md bg-muted dark:bg-gray-800"></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="h-8 w-full rounded-md bg-muted dark:bg-gray-800"></div>
                        <div className="h-64 w-full rounded-md bg-muted dark:bg-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute right-[10%] bottom-[10%] h-[250px] w-[250px] rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute left-[50%] bottom-0 h-[200px] w-[200px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Track your skincare routine and see what works best for your skin
            </p>
          </div>
          
          <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
            <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-800">
              <div className="h-2 bg-primary"></div>
              <CardHeader className="pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                    <rect x="9" y="3" width="6" height="4" rx="2"></rect>
                    <path d="M9 14h.01"></path>
                    <path d="M13 14h.01"></path>
                    <path d="M9 18h.01"></path>
                    <path d="M13 18h.01"></path>
                  </svg>
                </div>
                <CardTitle className="text-xl">Product Tracking</CardTitle>
                <CardDescription>
                  Log all your skincare products and track when you use them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Track product details
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Log usage frequency
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Rate effectiveness
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-800">
              <div className="h-2 bg-primary"></div>
              <CardHeader className="pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <CardTitle className="text-xl">Daily Routines</CardTitle>
                <CardDescription>
                  Create morning and evening routines to stay consistent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    AM/PM routines
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Daily reminders
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Track consistency
                  </li>
                </ul>
              </CardContent>
            </Card>
            
                 <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-800">
              <div className="h-2 bg-primary"></div>
              <CardHeader className="pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <CardTitle className="text-xl">Routine Logging</CardTitle>
                <CardDescription>
                  Log all your skincare steps and instructions for others to see
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Log skincare steps
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Add detailed instructions
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Share routines with others
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-800">
              <div className="h-2 bg-primary"></div>
              <CardHeader className="pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 12h20"></path>
                    <path d="M16 6l6 6-6 6"></path>
                    <path d="M8 18l-6-6 6-6"></path>
                  </svg>
                </div>
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor how your skin responds to different products over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Visual progress photos
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Effectiveness insights
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Trend analysis
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            

          </div>
        </div>
      </section>

      {/* How It Works Section with Timeline */}
      <section className="bg-muted/30 py-16 md:py-24 relative overflow-hidden dark:bg-gray-900/30">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple as 1-2-3
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Start tracking your skincare journey in three simple steps
            </p>
          </div>
          
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-lg">
                  1
                </div>
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary/30"></div>
                <h3 className="text-xl font-bold mb-2">Add Products</h3>
                <p className="text-muted-foreground">
                  Enter the skincare products you use regularly in your collection
                </p>
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-lg">
                  2
                </div>
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary/30"></div>
                <h3 className="text-xl font-bold mb-2">Log Routines</h3>
                <p className="text-muted-foreground">
                  Record which products you use each day in your morning and evening routines
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Track Results</h3>
                <p className="text-muted-foreground">
                  See which products and routines work best for your skin over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              What Our Users Say
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Join thousands of skincare enthusiasts who've improved their routines
            </p>
          </div>
          
          <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
            <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-800">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    S
                  </div>
                  <div>
                    <CardTitle className="text-base">Sarah K.</CardTitle>
                    <CardDescription>Skincare Enthusiast</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "This app has completely transformed my skincare routine. I can finally track what works and what doesn't!"
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-800">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    J
                  </div>
                  <div>
                    <CardTitle className="text-base">James T.</CardTitle>
                    <CardDescription>Skincare Newbie</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "As someone new to skincare, this app has been invaluable in helping me establish a consistent routine."
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-800 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    M
                  </div>
                  <div>
                    <CardTitle className="text-base">Michelle L.</CardTitle>
                    <CardDescription>Dermatologist</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "I recommend this app to all my patients. It helps them stay consistent and track their progress over time."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5 dark:from-background dark:to-primary/10">
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to transform your skincare routine?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                Join thousands of users who have improved their skin with Skincare Track
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 min-[400px]:flex-row pt-4">
              <Link to="/login">
                <Button size="lg" className="px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 