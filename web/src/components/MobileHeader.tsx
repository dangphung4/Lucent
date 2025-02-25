import { Link } from 'react-router-dom';
import LucentLogo from '../assets/lucent-logo.svg';
import { ThemeToggle } from './ui/theme-toggle';

export function MobileHeader() {
return (
    <header 
      className="z-50 bg-background border-b md:hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-12">
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