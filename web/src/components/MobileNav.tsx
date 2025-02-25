import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

/**
 * Renders the mobile navigation component.
 * This component displays a navigation bar at the bottom of the screen,
 * which includes links to various sections of the application such as
 * Dashboard, Journal, Calendar, and Settings. If the user is not logged in,
 * it shows links to Home and Sign In.
 *
 * @returns {JSX.Element} The rendered mobile navigation component.
 *
 * @example
 * // Usage within a React component
 * return (
 *   <MobileNav />
 * );
 *
 * @throws {Error} Throws an error if the user context is not available.
 */
export function MobileNav() {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);

  const isActive = (path: string) => location.pathname === path;

  // Get display name for avatar
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
    <div 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 md:hidden"
      style={{
        paddingBottom: 'max(5px, env(safe-area-inset-bottom))',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {currentUser ? (
          <>
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

            <Link 
              to="/journal" 
              className={`flex flex-col items-center justify-center w-full h-full text-xs ${
                isActive('/journal') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
              <span>Journal</span>
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
            
            <Link 
              to="/settings" 
              className={`flex flex-col items-center justify-center w-full h-full text-xs ${
                isActive('/settings') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative mb-1">
                <Avatar className="h-6 w-6 border border-muted">
                  {currentUser?.photoURL ? (
                    <AvatarImage src={currentUser.photoURL} alt={getDisplayName()} />
                  ) : (
                    <AvatarFallback className="text-xs">
                      {getAvatarInitial()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <span>Profile</span>
            </Link>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
} 