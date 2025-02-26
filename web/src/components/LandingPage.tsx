import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Chrome, Smartphone, Apple, Monitor, Share, Menu, Plus, ExternalLink } from 'lucide-react';

export function LandingPage() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col antialiased">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5 min-h-[90vh] flex items-center justify-center pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl">
          <div className="flex flex-col items-center text-center space-y-8 relative z-10">
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
                Your Personal Skincare Companion
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70 px-4">
                Your Skincare Journey, Tracked
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed px-4">
                Discover what works best for your skin by tracking products, routines, and results in one beautiful app. Join thousands of skincare enthusiasts today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
              {currentUser ? (
                <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full sm:w-auto px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                  Dashboard
                </Button>
              ) : (
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                  Get Started Free
                </Button>
              </Link>
              )}
              {currentUser ? (
                <Link to="/calendar" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full px-8 rounded-full border-2">
                    Calendar
                </Button>
                </Link>
              ) : (
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full px-8 rounded-full border-2">
                  Sign In
                </Button>
              </Link>
              )}
            </div>
            
            {/* App Preview Image */}
            <div className="relative w-full max-w-4xl mt-12 md:mt-20 px-4">
              {/* Enhanced background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl blur-3xl -z-10 transform scale-110"></div>
              
              {/* Simplified container with enhanced effects */}
              <div className="relative">
                {/* Enhanced border glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-primary/60 rounded-2xl blur-sm opacity-75"></div>
                
                {/* Main container with enhanced shadows */}
                <div className="relative bg-card border rounded-2xl shadow-2xl overflow-hidden dark:border-gray-800/50 backdrop-blur-sm">
                  {/* Enhanced browser-like top bar */}
                  <div className="bg-muted/40 border-b border-primary/10 p-3 flex items-center gap-2 backdrop-blur-sm">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/90"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500/90"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500/90"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="px-4 py-1.5 rounded-full bg-background/50 text-xs font-medium text-muted-foreground inline-block backdrop-blur-sm">skincaregod.vercel.app</div>
                    </div>
                  </div>
                  
                  {/* Enhanced image container */}
                  <div className="p-1 bg-gradient-to-b from-transparent to-background/5">
                    <img 
                      src={theme === 'light' ? '/dashboard-preview-light.png' : '/dashboard-preview.png'}
                      alt="Lucent Dashboard Preview" 
                      className="w-full h-auto rounded-xl shadow-xl"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
          <div className="absolute left-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-gradient-to-r from-primary/10 to-primary/5 blur-3xl opacity-80"></div>
          <div className="absolute right-[10%] bottom-[10%] h-[250px] w-[250px] rounded-full bg-gradient-to-l from-primary/10 to-primary/5 blur-3xl opacity-80"></div>
          <div className="absolute left-[50%] bottom-0 h-[200px] w-[200px] -translate-x-1/2 rounded-full bg-gradient-to-t from-primary/10 to-primary/5 blur-3xl opacity-80"></div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 px-4">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg leading-relaxed px-4">
              Track your skincare routine and see what works best for your skin with our comprehensive feature set
            </p>
          </div>
          
          <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl px-4">
            <Card className="group overflow-hidden transition-all hover:shadow-xl border-gray-200/50 dark:border-gray-800/50 relative bg-gradient-to-b from-background to-primary/5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60"></div>
              <CardHeader className="pb-2 relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                    <rect x="9" y="3" width="6" height="4" rx="2"></rect>
                    <path d="M9 14h.01"></path>
                    <path d="M13 14h.01"></path>
                    <path d="M9 18h.01"></path>
                    <path d="M13 18h.01"></path>
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold">Product Tracking</CardTitle>
                <CardDescription className="text-muted-foreground/90">
                  Log all your skincare products and track when you use them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-primary shrink-0">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="font-medium">Track product details</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-primary shrink-0">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="font-medium">Log usage frequency</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-primary shrink-0">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="font-medium">Rate effectiveness</span>
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
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl"></div>
          <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-gradient-to-t from-primary/5 to-transparent blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 px-4">
              Simple as 1-2-3
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg leading-relaxed px-4">
              Start tracking your skincare journey in three simple steps
            </p>
          </div>
          
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 gap-8 md:gap-12 md:grid-cols-3">
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-6 shadow-lg relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/80 rounded-2xl"></div>
                  <span className="relative">1</span>
                </div>
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10"></div>
                <h3 className="text-xl font-bold mb-3">Add Products</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enter the skincare products you use regularly in your collection
                </p>
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-6 shadow-lg relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/80 rounded-2xl"></div>
                  <span className="relative">2</span>
                </div>
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10"></div>
                <h3 className="text-xl font-bold mb-3">Log Routines</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Record which products you use each day in your morning and evening routines
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-6 shadow-lg relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary/80 rounded-2xl"></div>
                  <span className="relative">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Track Results</h3>
                <p className="text-muted-foreground leading-relaxed">
                  See which products and routines work best for your skin over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Installation Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
              Install the App
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70 px-4">
              Use Skincare God Anywhere
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg leading-relaxed px-4">
              Install our app on your device for the best experience. Access your skincare routine even when offline!
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Tabs defaultValue="desktop" className="w-full">
              <TabsList className="grid w-full grid-cols-3 p-1">
                <TabsTrigger value="desktop" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>Desktop</span>
                </TabsTrigger>
                <TabsTrigger value="android" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Android</span>
                </TabsTrigger>
                <TabsTrigger value="ios" className="flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  <span>iOS</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="desktop" className="mt-6">
                <Card className="border-2 border-primary/10 backdrop-blur-sm">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Chrome className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Install on Desktop</CardTitle>
                        <CardDescription>Chrome, Edge, or other Chromium browsers</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-none space-y-6">
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">1</div>
                        <div className="flex-1">
                          <p className="font-medium">Visit</p>
                          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono text-primary">skincaregod.vercel.app</span>
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">2</div>
                        <div className="flex-1">
                          <p className="font-medium">Click the install icon</p>
                          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <Plus className="h-4 w-4" /> in your browser's address bar
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">3</div>
                        <div className="flex-1">
                          <p className="font-medium">Click "Install" in the prompt</p>
                          <p className="mt-1 text-muted-foreground">The app will install and create a desktop shortcut</p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="android" className="mt-6">
                <Card className="border-2 border-primary/10 backdrop-blur-sm">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Smartphone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Install on Android</CardTitle>
                        <CardDescription>Chrome for Android</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-none space-y-6">
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">1</div>
                        <div className="flex-1">
                          <p className="font-medium">Visit in Chrome</p>
                          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono text-primary">skincaregod.vercel.app</span>
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">2</div>
                        <div className="flex-1">
                          <p className="font-medium">Tap the menu icon</p>
                          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <Menu className="h-4 w-4" /> in the top right
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">3</div>
                        <div className="flex-1">
                          <p className="font-medium">Tap "Add to Home screen"</p>
                          <p className="mt-1 text-muted-foreground">Choose a name and tap "Add"</p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ios" className="mt-6">
                <Card className="border-2 border-primary/10 backdrop-blur-sm">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Apple className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Install on iOS</CardTitle>
                        <CardDescription>Safari on iPhone or iPad</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-none space-y-6">
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">1</div>
                        <div className="flex-1">
                          <p className="font-medium">Visit in Safari</p>
                          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono text-primary">skincaregod.vercel.app</span>
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">2</div>
                        <div className="flex-1">
                          <p className="font-medium">Tap the Share button</p>
                          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <Share className="h-4 w-4" /> rectangle with arrow
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">3</div>
                        <div className="flex-1">
                          <p className="font-medium">Tap "Add to Home Screen"</p>
                          <p className="mt-1 text-muted-foreground">Choose a name and tap "Add"</p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 px-4">
              What Our Users Say
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg leading-relaxed px-4">
              Join other skincare enthusiasts who've improved their routines
            </p>
          </div>
          
          <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl px-4">
            <Card className="group overflow-hidden transition-all hover:shadow-xl border-gray-200/50 dark:border-gray-800/50 relative bg-gradient-to-b from-background to-primary/5">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-xl"></div>
                    <span className="relative">S</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Sarah K.</CardTitle>
                    <CardDescription className="text-muted-foreground/90">Skincare Enthusiast</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  "This app has completely transformed my skincare routine. I can finally track what works and what doesn't!"
                </p>
              </CardContent>
            </Card>
            
            <Card className="group overflow-hidden transition-all hover:shadow-xl border-gray-200/50 dark:border-gray-800/50 relative bg-gradient-to-b from-background to-primary/5">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-xl"></div>
                    <span className="relative">J</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">James T.</CardTitle>
                    <CardDescription className="text-muted-foreground/90">Skincare Newbie</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  "As someone new to skincare, this app has been invaluable in helping me establish a consistent routine."
                </p>
              </CardContent>
            </Card>
            
            <Card className="group overflow-hidden transition-all hover:shadow-xl border-gray-200/50 dark:border-gray-800/50 relative bg-gradient-to-b from-background to-primary/5 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-xl"></div>
                    <span className="relative">M</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Michelle L.</CardTitle>
                    <CardDescription className="text-muted-foreground/90">Dermatologist</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  "I recommend this app to all my patients. It helps them stay consistent and track their progress over time."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5 dark:from-background dark:to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-grid-primary/5 mask-gradient-to-b"></div>
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-screen-xl relative">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 px-4">
                Ready to transform your skincare routine?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg leading-relaxed px-4">
                Join thousands of skincare enthusiasts who've improved their routines with our app
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-8 px-4">
              {currentUser ? (
                <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full sm:w-auto px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                  Go to Dashboard
                </Button>
              ) : (
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 