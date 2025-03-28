import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { User, LogOut, Key, Download, Trash2, Check, ChevronRight, Loader2, Image, X, Plus, ChevronsUpDown, Sparkles, Settings as SettingsIcon, Camera, Palette, Heart, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { isUsernameAvailable, COMMON_SKIN_CONCERNS } from '../lib/db';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export function Settings() {
  const { currentUser, updateUserData, userProfile, logOut } = useAuth();
  
  // Profile update states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [skinType, setSkinType] = useState<'oily' | 'dry' | 'combination' | 'normal' | 'sensitive'>('combination');
  const [isUpdating, setIsUpdating] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [photoURLError, setPhotoURLError] = useState('');
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customConcern, setCustomConcern] = useState('');

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
        setSkinType(userProfile.skinType || 'combination');
        setSkinConcerns(userProfile.skinConcerns || []);
      }
    }
  }, [currentUser, userProfile, defaultDisplayName]);

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
    
    try {
      new URL(value);
      setPhotoURLError('');
    } catch {
      setPhotoURLError('Please enter a valid URL');
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
      
      // Validate photo URL before updating
      if (photoURL) {
        try {
          await fetch(photoURL, { method: 'HEAD' });
        } catch {
          setPhotoURLError('Unable to access this image URL. Please make sure it is publicly accessible.');
          setIsUpdating(false);
          return;
        }
      }
      
      // Update user profile using the context function
      await updateUserData({
        displayName,
        photoURL,
        username: username || undefined,
        skinType: skinType || 'combination',
        skinConcerns
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
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

  // Handle adding custom concern
  const handleAddCustomConcern = () => {
    if (customConcern.trim() && !skinConcerns.includes(customConcern.trim())) {
      setSkinConcerns([...skinConcerns, customConcern.trim()]);
      setCustomConcern('');
      setIsAddingCustom(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </motion.div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          exit="hidden"
          variants={fadeIn}
          className="space-y-6"
        >
          {/* Profile Section */}
          <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                {/* Profile Picture & Basic Info */}
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                    <Avatar className="h-24 w-24 border-4 border-primary/20 ring-4 ring-background relative">
                      {photoURL ? (
                        <AvatarImage src={photoURL} alt={displayName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-2xl font-semibold">
                          {displayName.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{displayName || defaultDisplayName}</h3>
                    <p className="text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </div>

                {/* Profile Form Fields */}
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Display Name
                    </Label>
                    <Input 
                      id="displayName" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="h-11 bg-background/50 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photoURL" className="text-sm font-medium flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
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
                      className={cn("h-11 bg-background/50 backdrop-blur-sm", photoURLError && "border-red-500")}
                    />
                    {photoURLError && (
                      <p className="text-xs text-red-500">{photoURLError}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      Username
                    </Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => {
                        setUsername(e.target.value);
                        validateUsername(e.target.value);
                      }}
                      placeholder="Choose a unique username"
                      className={cn("h-11 bg-background/50 backdrop-blur-sm", usernameError && "border-red-500")}
                    />
                    {usernameError ? (
                      <p className="text-xs text-red-500">{usernameError}</p>
                    ) : username && (
                      <p className="text-xs text-green-500">
                        Your profile will be available at /profile/{username}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skinType" className="text-sm font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Skin Type
                    </Label>
                    <select
                      id="skinType"
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value as typeof skinType)}
                      className="w-full h-11 rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="combination">Combination</option>
                      <option value="oily">Oily</option>
                      <option value="dry">Dry</option>
                      <option value="normal">Normal</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  </div>
                </div>

                {/* Skin Concerns Section */}
                <div className="space-y-4 bg-gradient-to-br from-background/50 to-primary/5 p-6 rounded-xl border backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Badge variant="outline" className="text-xs py-0 px-2 bg-primary/10">Concerns</Badge>
                      Skin Concerns
                    </Label>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {skinConcerns.length} Selected
                    </Badge>
                  </div>

                  {/* Search and Add Section */}
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search skin concerns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-11 bg-background/50 backdrop-blur-sm"
                      />
                    </div>

                    {/* Custom Concern Input */}
                    {isAddingCustom && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                      >
                        <Input
                          placeholder="Enter custom skin concern..."
                          value={customConcern}
                          onChange={(e) => setCustomConcern(e.target.value)}
                          className="h-11 bg-background/50 backdrop-blur-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleAddCustomConcern}
                          className="h-11"
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAddingCustom(false);
                            setCustomConcern('');
                          }}
                          className="h-11"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    )}

                    {/* Add Custom Button */}
                    {!isAddingCustom && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingCustom(true)}
                        className="w-full justify-between border-dashed hover:border-primary hover:text-primary transition-colors h-11 bg-background/50 backdrop-blur-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Custom Concern
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Selected Concerns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {skinConcerns.map((concern, index) => {
                      let badgeStyle = "";
                      if (concern.includes("acne")) {
                        badgeStyle = "bg-red-500/10 text-red-500 border-red-500/20";
                      } else if (concern.includes("aging")) {
                        badgeStyle = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                      } else if (concern.includes("dark spots")) {
                        badgeStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                      } else if (concern.includes("dryness")) {
                        badgeStyle = "bg-orange-500/10 text-orange-500 border-orange-500/20";
                      } else if (concern.includes("oiliness")) {
                        badgeStyle = "bg-green-500/10 text-green-500 border-green-500/20";
                      } else if (concern.includes("redness")) {
                        badgeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/20";
                      } else if (concern.includes("texture")) {
                        badgeStyle = "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
                      } else if (concern.includes("sun")) {
                        badgeStyle = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
                      } else if (concern.includes("eczema")) {
                        badgeStyle = "bg-pink-500/10 text-pink-500 border-pink-500/20";
                      } else {
                        badgeStyle = "bg-purple-500/10 text-purple-500 border-purple-500/20";
                      }

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`group flex items-center justify-between p-3 rounded-lg border ${badgeStyle} transition-all hover:bg-opacity-20 backdrop-blur-sm`}
                        >
                          <span className="text-sm font-medium">{concern}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newConcerns = skinConcerns.filter((_, i) => i !== index);
                              setSkinConcerns(newConcerns);
                            }}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Common Concerns Grid */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Common Concerns</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {COMMON_SKIN_CONCERNS
                        .filter(concern => 
                          concern.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((concern) => {
                          let badgeStyle = "";
                          if (concern.includes("acne")) {
                            badgeStyle = "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20";
                          } else if (concern.includes("aging")) {
                            badgeStyle = "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20";
                          } else if (concern.includes("dark spots")) {
                            badgeStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20";
                          } else if (concern.includes("dryness")) {
                            badgeStyle = "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20";
                          } else if (concern.includes("oiliness")) {
                            badgeStyle = "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20";
                          } else if (concern.includes("redness")) {
                            badgeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20";
                          } else if (concern.includes("texture")) {
                            badgeStyle = "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20";
                          } else if (concern.includes("sun")) {
                            badgeStyle = "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20";
                          } else if (concern.includes("eczema")) {
                            badgeStyle = "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20";
                          } else {
                            badgeStyle = "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20";
                          }

                          return (
                            <motion.button
                              key={concern}
                              type="button"
                              onClick={() => {
                                if (!skinConcerns.includes(concern)) {
                                  setSkinConcerns([...skinConcerns, concern]);
                                }
                              }}
                              className={`p-3 rounded-lg border ${badgeStyle} transition-all text-sm font-medium text-left ${
                                skinConcerns.includes(concern) ? 'ring-2 ring-primary ring-offset-2' : ''
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {concern}
                            </motion.button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 mt-4 backdrop-blur-sm">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-primary">
                        Personalized Recommendations
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Select your skin concerns to get tailored product recommendations and skincare advice. Our AI assistant will analyze your concerns and suggest the most effective products and routines for your unique needs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Badge variant="outline" className="text-xs py-0 px-2">Security</Badge>
                    Account Actions
                  </h3>
                  <div className="grid gap-3">
                    <Button variant="outline" className="w-full justify-between group hover:border-primary/50 transition-all h-11 bg-background/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span>Change Password</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between group hover:border-primary/50 transition-all h-11 bg-background/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span>Export Your Data</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                    <Separator className="my-2" />
                    <Button variant="destructive" className="w-full justify-between group h-11">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
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
      </div>
    </div>
  );
} 