import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

interface RootLayoutProps {
  children?: ReactNode;
}

/**
 * A functional component that serves as the root layout for the application.
 * It wraps the main content of the application and includes common UI elements
 * such as the Navbar, MobileHeader, Footer, and MobileNav.
 *
 * @param {RootLayoutProps} props - The properties for the RootLayout component.
 * @param {React.ReactNode} props.children - The child components to be rendered
 * within the main content area. If no children are provided, an Outlet component
 * will be rendered by default.
 *
 * @returns {JSX.Element} The rendered layout component.
 *
 * @example
 * // Example usage of RootLayout
 * <RootLayout>
 *   <YourComponent />
 * </RootLayout>
 *
 * @throws {Error} Throws an error if the props are not of the expected type.
 */
export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
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