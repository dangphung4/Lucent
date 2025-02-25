import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Settings, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

export function Navbar() {
  const { currentUser, logOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    return currentUser?.email?.split('@')[0] || 'User';
  };

  // Get avatar initial
  const getAvatarInitial = () => {
    if (currentUser?.displayName) return currentUser.displayName.charAt(0).toUpperCase();
    return currentUser?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 hidden md:block ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-md border-b' 
          : 'bg-background border-b border-transparent'
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-all duration-300 group-hover:scale-110">
              <span className="text-lg font-bold text-primary-foreground">ST</span>
            </div>
            <span className="text-xl font-bold transition-colors duration-200 group-hover:text-primary">
              Skincare Track
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {currentUser && (
                <>
                  <Link 
                    to="/calendar" 
                    className={`text-sm font-medium transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full ${
                      location.pathname === '/calendar' ? 'text-primary after:w-full' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Calendar
                    </div>
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className={`text-sm font-medium transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full ${
                      location.pathname === '/dashboard' ? 'text-primary after:w-full' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                      Dashboard
                    </div>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pl-2">
              <ThemeToggle />
              
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-muted/50">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        {currentUser.photoURL ? (
                          <AvatarImage src={currentUser.photoURL} alt={getDisplayName()} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getAvatarInitial()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings?tab=account')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full transition-all hover:bg-primary/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      size="sm"
                      className="rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
} 