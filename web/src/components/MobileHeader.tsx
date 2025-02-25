import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LucentLogo from '../assets/lucent-logo.svg';
import { ThemeToggle } from './ui/theme-toggle';

/**
 * A functional component that renders a mobile header for the application.
 * The header includes a logo and a theme toggle button. It also implements
 * a scroll effect that changes the background of the header based on the
 * scroll position of the window.
 *
 * @returns {JSX.Element} The rendered mobile header component.
 *
 * @example
 * // Usage in a React component
 * function App() {
 *   return (
 *     <div>
 *       <MobileHeader />
 *       {/* Other components */
export function MobileHeader() {
  const [scrolled, setScrolled] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:hidden
        ${scrolled 
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' 
          : 'bg-transparent'}`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 10px)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-12 mt-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={LucentLogo} alt="Lucent Logo" className="w-8 h-8" />
            <span className="text-xl font-bold transition-colors duration-200 group-hover:text-primary">
              Lucent
            </span>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 