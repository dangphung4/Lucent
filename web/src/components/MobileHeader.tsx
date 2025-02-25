import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LucentLogo from '../assets/lucent-logo.svg';

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 md:hidden ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-md border-b' 
          : 'bg-background border-b border-transparent'
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={LucentLogo} alt="Lucent Logo" className="w-8 h-8" />
            <span className="text-xl font-bold transition-colors duration-200 group-hover:text-primary">
                Lucent
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
} 