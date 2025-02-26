import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RootLayout } from './components/RootLayout';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { Settings } from './components/Settings';
import { useContext, useEffect } from 'react';
import { AuthContext, AuthProvider } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import PWABadge from './PWABadge';
import { Journal } from './components/Journal';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useContext(AuthContext);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

/**
 * The main application component that sets up the overall structure of the app.
 * It wraps the application in various providers such as ThemeProvider and AuthProvider,
 * and sets up routing using React Router.
 *
 * This component includes:
 * - A theme context for styling.
 * - An authentication context for managing user sessions.
 * - A router for navigating between different views of the application.
 *
 * The routing structure includes:
 * - A landing page accessible at the root path ("/").
 * - A login page accessible at "/login".
 * - Protected routes for calendar, settings, and dashboard, which require authentication.
 * - A fallback route that redirects any unknown paths to the landing page.
 *
 * @returns {JSX.Element} The rendered application component.
 *
 * @example
 * // Usage of the App component
 * import React from 'react';
 * import ReactDOM from 'react-dom';
 * import App from './App';
 *
 * ReactDOM.render(<App />, document.getElementById('root'));
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/journal"
                element={
                  <ProtectedRoute>
                    <Journal />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
          <Toaster />
          <PWABadge />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
