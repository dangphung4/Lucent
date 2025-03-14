import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * Renders the login and signup page for the application.
 * This component manages user authentication through email/password and Google sign-in.
 * It handles user state, error messages, and loading states during authentication processes.
 *
 * @returns {JSX.Element} The rendered login/signup page component.
 *
 * @example
 * // Usage in a parent component
 * <LoginPage />
 *
 * @throws {Error} Throws an error if the authentication fails, which is caught and displayed to the user.
 */
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  /**
   * Handles email authentication for user sign-up or sign-in.
   *
   * This asynchronous function manages the authentication process based on the
   * provided `isSignUp` flag. It sets the loading state and handles any errors
   * that may occur during the authentication process.
   *
   * @param {boolean} isSignUp - A flag indicating whether the operation is a sign-up
   *                             (true) or a sign-in (false).
   * @returns {Promise<void>} A promise that resolves when the authentication process
   *                          is complete.
   *
   * @throws {Error} Throws an error if the authentication fails, which is caught
   *                 and handled within the function.
   *
   * @example
   * // To sign up a user
   * await handleEmailAuth(true);
   *
   * // To sign in a user
   * await handleEmailAuth(false);
   */
  const handleEmailAuth = async (isSignUp: boolean) => {
    setError('');
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // No need to manually navigate here as the useEffect will handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the Google sign-in process.
   *
   * This asynchronous function initiates the sign-in process with Google. It manages loading states and error handling.
   *
   * It sets an error message to an empty string and indicates that the loading process has started. Upon successful sign-in,
   * it relies on a useEffect hook to manage navigation, thus no manual navigation is required. If an error occurs during the
   * sign-in process, it captures the error and sets an appropriate error message. Finally, it ensures that the loading state
   * is reset regardless of the outcome.
   *
   * @async
   * @function handleGoogleSignIn
   * @returns {Promise<void>} A promise that resolves when the sign-in process is complete.
   *
   * @throws {Error} Throws an error if the sign-in process fails, which is caught and handled within the function.
   *
   * @example
   * handleGoogleSignIn()
   *   .then(() => {
   *     console.log('Sign-in successful');
   *   })
   *   .catch((error) => {
   *     console.error('Sign-in failed:', error);
   *   });
   */
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      // No need to manually navigate here as the useEffect will handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-16 flex-1 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 z-0 opacity-50"></div>
          
          <CardHeader className="relative z-10 text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome to Lucent</CardTitle>
            <CardDescription>
              Sign in to track your skincare routine and see results
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 pt-0">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-md"
                  />
                </div>
                
                <Button 
                  className="w-full rounded-full" 
                  onClick={() => handleEmailAuth(false)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-md"
                  />
                </div>
                
                <Button 
                  className="w-full rounded-full" 
                  onClick={() => handleEmailAuth(true)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full rounded-full flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg
                className="h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
          
          <CardFooter className="relative z-10 flex justify-center pt-0 pb-6">
            <p className="text-xs text-muted-foreground text-center mt-4">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 