import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTheme } from '../lib/ThemeProvider';
import { Moon, Sun, Monitor, User, Bell, LogOut, Key, Download, Trash2, Check, ChevronRight, Loader2, Image } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useLocation } from 'react-router-dom';
import { Input } from './ui/input';
import { isUsernameAvailable } from '../lib/db';
import { toast } from 'sonner';

export function Settings() {
  const { currentUser, updateUserData, userProfile, logOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    morningReminder: true,
    eveningReminder: true,
    productReminders: false,
    weeklyReport: true
  });
  
  // Profile update states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [photoURLError, setPhotoURLError] = useState('');
  
  // Get first name from email or use "there" as fallback
  const firstName = currentUser?.email?.split('@')[0] || 'there';
  const defaultDisplayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  // Load user profile data
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || defaultDisplayName);
      setPhotoURL(currentUser.photoURL || '');
      
      if (userProfile) {
        setUsername(userProfile.username || '');
      }
    }
  }, [currentUser, userProfile, defaultDisplayName]);
  
  // Handle notification change
  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Set active tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['account', 'appearance', 'notifications'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Handle username validation
  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('');
      return;
    }
    
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    setUsernameError('');
  };

  // Handle photo URL validation
  const validatePhotoURL = (value: string) => {
    if (!value) {
      setPhotoURLError('');
      return;
    }
    
    // Simple URL validation using regex
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(value)) {
      setPhotoURLError('Please enter a valid URL');
    } else {
      setPhotoURLError('');
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    if (usernameError || photoURLError) {
      toast.error('Please fix the errors before saving');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Check if username is available (if changed)
      if (username && (!userProfile?.username || username !== userProfile.username)) {
        const isAvailable = await isUsernameAvailable(username);
        if (!isAvailable) {
          setUsernameError('This username is already taken');
          setIsUpdating(false);
          return;
        }
      }
      
      // Update user profile using the context function
      await updateUserData({
        displayName,
        photoURL,
        username: username || undefined
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  return (
    <div className="container max-w-5xl mx-auto px-4 md:py-12 pb-12">
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-8 border rounded-lg p-1 bg-muted/30">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account" className="data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-2 items-center justify-center">
              <User className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-2 items-center justify-center">
              <Sun className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-2 items-center justify-center">
              <Bell className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="account">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs py-0 px-2">Profile</Badge>
                    Your Information
                  </h3>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <Avatar className="h-20 w-20 border-4 border-primary/10">
                        {photoURL ? (
                          <AvatarImage src={photoURL} alt={displayName} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                            {displayName.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-xl">{displayName || defaultDisplayName}</p>
                        <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          value={displayName} 
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your display name"
                        />
                        <p className="text-xs text-muted-foreground">
                          This is how your name will appear throughout the app
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="photoURL" className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Profile Picture URL
                        </Label>
                        <Input 
                          id="photoURL" 
                          value={photoURL} 
                          onChange={(e) => {
                            setPhotoURL(e.target.value);
                            validatePhotoURL(e.target.value);
                          }}
                          placeholder="https://example.com/your-photo.jpg"
                          className={photoURLError ? "border-red-500" : ""}
                        />
                        {photoURLError ? (
                          <p className="text-xs text-red-500">{photoURLError}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Enter a URL to your profile picture (JPG, PNG, or GIF)
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={username} 
                          onChange={(e) => {
                            setUsername(e.target.value);
                            validateUsername(e.target.value);
                          }}
                          placeholder="Choose a unique username"
                          className={usernameError ? "border-red-500" : ""}
                        />
                        {usernameError ? (
                          <p className="text-xs text-red-500">{usernameError}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Your username will be used for your profile URL
                          </p>
                        )}
                        {username && !usernameError && (
                          <p className="text-xs text-green-500">
                            Your profile will be available at /profile/{username}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="gap-2"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Save Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs py-0 px-2">Security</Badge>
                    Account Settings
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-between group hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span>Change Password</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between group hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span>Export Your Data</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                    <Separator className="my-4" />
                    <Button variant="destructive" className="w-full justify-between group">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" className="gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
                <Button className="gap-2" onClick={handleProfileUpdate} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="appearance">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how the app looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs py-0 px-2">Display</Badge>
                    Theme Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      className={`flex flex-col items-center justify-center h-32 space-y-3 rounded-xl transition-all ${theme === "light" ? "border-primary shadow-md" : "hover:border-primary/50"}`}
                      onClick={() => setTheme("light")}
                    >
                      <div className={`p-3 rounded-full ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Sun className="h-6 w-6" />
                      </div>
                      <span>Light Mode</span>
                      {theme === "light" && <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Active</Badge>}
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      className={`flex flex-col items-center justify-center h-32 space-y-3 rounded-xl transition-all ${theme === "dark" ? "border-primary shadow-md" : "hover:border-primary/50"}`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className={`p-3 rounded-full ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Moon className="h-6 w-6" />
                      </div>
                      <span>Dark Mode</span>
                      {theme === "dark" && <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Active</Badge>}
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      className={`flex flex-col items-center justify-center h-32 space-y-3 rounded-xl transition-all ${theme === "system" ? "border-primary shadow-md" : "hover:border-primary/50"}`}
                      onClick={() => setTheme("system")}
                    >
                      <div className={`p-3 rounded-full ${theme === "system" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Monitor className="h-6 w-6" />
                      </div>
                      <span>System Default</span>
                      {theme === "system" && <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Active</Badge>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure when and how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-5">
                  <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between transition-all hover:bg-muted/50">
                    <div className="space-y-1">
                      <Label htmlFor="morning-reminder" className="text-base font-medium flex items-center gap-2">
                        <Badge variant="outline" className={`${notifications.morningReminder ? "bg-green-500/10 text-green-500" : "bg-muted"}`}>
                          {notifications.morningReminder ? "Enabled" : "Disabled"}
                        </Badge>
                        Morning Routine Reminder
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a reminder to log your morning skincare routine
                      </p>
                    </div>
                    <Switch 
                      id="morning-reminder" 
                      checked={notifications.morningReminder}
                      onCheckedChange={() => handleNotificationChange('morningReminder')}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between transition-all hover:bg-muted/50">
                    <div className="space-y-1">
                      <Label htmlFor="evening-reminder" className="text-base font-medium flex items-center gap-2">
                        <Badge variant="outline" className={`${notifications.eveningReminder ? "bg-green-500/10 text-green-500" : "bg-muted"}`}>
                          {notifications.eveningReminder ? "Enabled" : "Disabled"}
                        </Badge>
                        Evening Routine Reminder
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a reminder to log your evening skincare routine
                      </p>
                    </div>
                    <Switch 
                      id="evening-reminder" 
                      checked={notifications.eveningReminder}
                      onCheckedChange={() => handleNotificationChange('eveningReminder')}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between transition-all hover:bg-muted/50">
                    <div className="space-y-1">
                      <Label htmlFor="product-reminders" className="text-base font-medium flex items-center gap-2">
                        <Badge variant="outline" className={`${notifications.productReminders ? "bg-green-500/10 text-green-500" : "bg-muted"}`}>
                          {notifications.productReminders ? "Enabled" : "Disabled"}
                        </Badge>
                        Product Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when it's time to replace your products
                      </p>
                    </div>
                    <Switch 
                      id="product-reminders" 
                      checked={notifications.productReminders}
                      onCheckedChange={() => handleNotificationChange('productReminders')}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between transition-all hover:bg-muted/50">
                    <div className="space-y-1">
                      <Label htmlFor="weekly-report" className="text-base font-medium flex items-center gap-2">
                        <Badge variant="outline" className={`${notifications.weeklyReport ? "bg-green-500/10 text-green-500" : "bg-muted"}`}>
                          {notifications.weeklyReport ? "Enabled" : "Disabled"}
                        </Badge>
                        Weekly Progress Report
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of your skincare routine
                      </p>
                    </div>
                    <Switch 
                      id="weekly-report" 
                      checked={notifications.weeklyReport}
                      onCheckedChange={() => handleNotificationChange('weeklyReport')}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-6">
                <Button className="ml-auto gap-2">
                  <Check className="h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 