import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';

export function Navbar() {
  const { currentUser, logOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <Link 
                to="/features" 
                className={`text-sm font-medium transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full ${
                  location.pathname === '/features' ? 'text-primary after:w-full' : ''
                }`}
              >
                Features
              </Link>
              <Link 
                to="/how-it-works" 
                className={`text-sm font-medium transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full ${
                  location.pathname === '/how-it-works' ? 'text-primary after:w-full' : ''
                }`}
              >
                How It Works
              </Link>
              {currentUser && (
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full ${
                    location.pathname === '/dashboard' ? 'text-primary after:w-full' : ''
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3 pl-2">
              <ThemeToggle />
              
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-2 lg:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">
                      {currentUser.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={logOut}
                    className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Log Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full transition-all hover:bg-primary/10"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      size="sm"
                      className="rounded-full shadow-sm hover:shadow-md transition-all"
                    >
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