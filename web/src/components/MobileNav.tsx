import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '../lib/utils';
import { ReactNode } from 'react';

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

  const NavLink = ({ to, icon, label, isActive }: { to: string; icon: ReactNode; label: string; isActive: boolean }) => (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center w-full h-full text-xs transition-all duration-200 ease-in-out relative group",
        isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
      )}
    >
      <div className={cn(
        "relative p-2 rounded-xl transition-all duration-200 ease-in-out transform group-hover:scale-110",
        isActive ? "bg-primary/10" : "group-hover:bg-primary/5"
      )}>
        {icon}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
        )}
      </div>
      <span className={cn(
        "mt-1 font-medium tracking-wide transition-all duration-200",
        isActive ? "scale-105" : "group-hover:scale-105"
      )}>
        {label}
      </span>
      {isActive && (
        <div className="absolute -bottom-4 w-12 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full" />
      )}
    </Link>
  );

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/50 z-40 md:hidden"
      style={{
        paddingBottom: 'max(5px, env(safe-area-inset-bottom))',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {currentUser ? (
          <>
            <NavLink 
              to="/dashboard"
              isActive={isActive('/dashboard')}
              label="Dashboard"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              }
            />

            <NavLink 
              to="/journal"
              isActive={isActive('/journal')}
              label="Journal"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
              }
            />
            
            <NavLink 
              to="/ai"
              isActive={isActive('/ai')}
              label="AI"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <path d="M7 7h.01"></path>
                  <path d="M12 7h.01"></path>
                  <path d="M17 7h.01"></path>
                  <path d="M7 12h.01"></path>
                  <path d="M12 12h.01"></path>
                  <path d="M17 12h.01"></path>
                  <path d="M7 17h.01"></path>
                  <path d="M12 17h.01"></path>
                  <path d="M17 17h.01"></path>
                </svg>
              }
            />
            
            <NavLink 
              to="/calendar"
              isActive={isActive('/calendar')}
              label="Calendar"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              }
            />
            
            <NavLink 
              to="/settings"
              isActive={isActive('/settings')}
              label="Profile"
              icon={
                <div className="transform transition-transform duration-200 group-hover:scale-110">
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    {currentUser?.photoURL ? (
                      <AvatarImage src={currentUser.photoURL} alt={getDisplayName()} />
                    ) : (
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getAvatarInitial()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              }
            />
          </>
        ) : (
          <>
            <NavLink 
              to="/"
              isActive={isActive('/')}
              label="Home"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              }
            />

            <NavLink 
              to="/login"
              isActive={isActive('/login')}
              label="Sign In"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              }
            />
          </>
        )}
      </div>
    </div>
  );
} 