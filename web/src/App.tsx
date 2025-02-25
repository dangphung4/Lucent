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
