import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../lib/AuthContext';
import { ThemeToggle } from './ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

/**
 * A functional component that renders a mobile navigation bar.
 * The navigation bar includes links to different sections of the application,
 * such as Home, Calendar, Dashboard, Settings, and Login/Sign In.
 * It also displays a theme toggle button and the user's avatar if logged in.
 *
 * @returns {JSX.Element} The rendered mobile navigation bar.
 *
 * @example
 * // Usage in a parent component
 * <MobileNav />
 *
 * @throws {Error} Throws an error if the user context is not available.
 */
export function MobileNav() {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const isActive = (path: string) => location.pathname === path;

  // Get display name for avatar
  /**
   * Retrieves the display name of the current user.
   * If the user has a display name, it returns that.
   * Otherwise, it attempts to return the user's email prefix
   * (the part before the '@' symbol). If neither is available,
   * it defaults to returning 'User'.
   *
   * @returns {string} The display name of the user, or 'User' if not available.
   *
   * @example
   * const name = getDisplayName();
   * console.log(name); // Outputs the display name or 'User'
   *
   * @throws {Error} Throws an error if the currentUser is undefined.
   */
  const getDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    return currentUser?.email?.split('@')[0] || 'User';
  };

  // Get avatar initial
  /**
   * Retrieves the initial character for the user's avatar.
   *
   * The function checks if the current user has a display name.
   * If a display name exists, it returns the first character of the display name in uppercase.
   * If the display name does not exist, it checks the user's email and returns the first character of the email in uppercase.
   * If neither the display name nor the email is available, it defaults to returning 'U'.
   *
   * @returns {string} The uppercase initial character for the avatar, or 'U' if no valid initial can be determined.
   *
   * @example
   * // Assuming currentUser.displayName is 'John Doe'
   * getAvatarInitial(); // Returns 'J'
   *
   * @example
   * // Assuming currentUser.email is 'johndoe@example.com'
   * getAvatarInitial(); // Returns 'J'
   *
   * @example
   * // Assuming currentUser.displayName and currentUser.email are both undefined
   * getAvatarInitial(); // Returns 'U'
   */
  const getAvatarInitial = () => {
    if (currentUser?.displayName) return currentUser.displayName.charAt(0).toUpperCase();
    return currentUser?.email?.charAt(0).toUpperCase() || 'U';
  };

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
          
          {currentUser ? (
            <>
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
        </div>
      </div>
    </>
  );
} 