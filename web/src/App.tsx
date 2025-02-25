import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeProvider';
import { RootLayout } from './components/RootLayout';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import PWABadge from './PWABadge';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={
        <RootLayout>
          <LandingPage />
        </RootLayout>
      } />
      <Route 
        path="/login" 
        element={
          <RootLayout>
            {currentUser ? <Navigate to="/dashboard" /> : <LoginPage />}
          </RootLayout>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <RootLayout>
              <Dashboard />
            </RootLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="/features" element={
        <RootLayout>
          <LandingPage />
        </RootLayout>
      } />
      <Route path="/how-it-works" element={
        <RootLayout>
          <LandingPage />
        </RootLayout>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
          <PWABadge />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
