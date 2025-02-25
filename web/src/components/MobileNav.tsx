import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { ThemeToggle } from './ui/theme-toggle';

export function MobileNav() {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        <Link 
          to="/" 
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <div className={`flex flex-col items-center justify-center ${
            location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="text-xs">Home</span>
          </div>
        </Link>

        <Link 
          to="/features" 
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <div className={`flex flex-col items-center justify-center ${
            location.pathname === '/features' ? 'text-primary' : 'text-muted-foreground'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <path d="M12 2v20"></path>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span className="text-xs">Features</span>
          </div>
        </Link>

        {currentUser ? (
          <Link 
            to="/dashboard" 
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <div className={`flex flex-col items-center justify-center ${
              location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span className="text-xs">Dashboard</span>
            </div>
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <div className={`flex flex-col items-center justify-center ${
              location.pathname === '/login' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span className="text-xs">Sign In</span>
            </div>
          </Link>
        )}

        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-1 flex items-center justify-center">
              <ThemeToggle />
            </div>
            <span className="text-xs text-muted-foreground">Theme</span>
          </div>
        </div>
      </div>
    </div>
  );
} 