import { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTheme } from '../lib/ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';

export function Settings() {
  const { currentUser } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    morningReminder: true,
    eveningReminder: true,
    productReminders: false,
    weeklyReport: true
  });
  
  // Get first name from email or use "there" as fallback
  const firstName = currentUser?.email?.split('@')[0] || 'there';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Profile</h3>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                    {displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Account Settings</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export Your Data
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"} 
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-6 w-6" />
                    <span>Light</span>
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"} 
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-6 w-6" />
                    <span>Dark</span>
                  </Button>
                  <Button 
                    variant={theme === "system" ? "default" : "outline"} 
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-6 w-6" />
                    <span>System</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure when and how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="morning-reminder">Morning Routine Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a reminder to log your morning skincare routine
                    </p>
                  </div>
                  <Switch 
                    id="morning-reminder" 
                    checked={notifications.morningReminder}
                    onCheckedChange={() => handleNotificationChange('morningReminder')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="evening-reminder">Evening Routine Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a reminder to log your evening skincare routine
                    </p>
                  </div>
                  <Switch 
                    id="evening-reminder" 
                    checked={notifications.eveningReminder}
                    onCheckedChange={() => handleNotificationChange('eveningReminder')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="product-reminders">Product Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when it's time to replace your products
                    </p>
                  </div>
                  <Switch 
                    id="product-reminders" 
                    checked={notifications.productReminders}
                    onCheckedChange={() => handleNotificationChange('productReminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-report">Weekly Progress Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your skincare routine
                    </p>
                  </div>
                  <Switch 
                    id="weekly-report" 
                    checked={notifications.weeklyReport}
                    onCheckedChange={() => handleNotificationChange('weeklyReport')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 