import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

interface RootLayoutProps {
  children?: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <MobileHeader />
      <main className="flex-1 pb-16 md:pb-0">
        {children || <Outlet />}
      </main>
      <MobileNav />
      <Footer className="hidden md:block" />
    </div>
  );
} 