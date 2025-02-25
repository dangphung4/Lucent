import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../lib/AuthContext';
import { ThemeToggle } from './ui/theme-toggle';

export function MobileNav() {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Theme Toggle at Top Right */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <ThemeToggle />
      </div>
      
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          <Link 
            to="/" 
            className={`flex flex-col items-center justify-center w-full h-full text-xs ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </Link>
          
          <Link 
            to="/calendar" 
            className={`flex flex-col items-center justify-center w-full h-full text-xs ${
              isActive('/calendar') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Calendar</span>
          </Link>
          
          {currentUser ? (
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center justify-center w-full h-full text-xs ${
                isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className={`flex flex-col items-center justify-center w-full h-full text-xs ${
                isActive('/login') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>Sign In</span>
            </Link>
          )}
          
          <Link 
            to="/settings" 
            className={`flex flex-col items-center justify-center w-full h-full text-xs ${
              isActive('/settings') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </>
  );
} 