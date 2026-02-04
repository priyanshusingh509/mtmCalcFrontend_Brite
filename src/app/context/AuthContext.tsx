'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  RefObject,
  ReactNode,
  JSX,
} from 'react';
import { useRouter } from 'next/navigation';

/**
 * @interface AuthContextType
 * Defines the shape of the authentication context data.
 */
interface AuthContextType {
  /**
   * A ref object holding the user's authentication status.
   */
  isAuthenticated: RefObject<boolean>;
  /**
   * A boolean state that indicates whether the authentication check is in progress.
   * This is true on initial load and becomes false once the check is complete.
   */
  loading: boolean;
}

/**
 * @constant AuthContext
 * The React context for managing authentication state throughout the application.
 */
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: { current: false },
  loading: true,
});

/**
 * @component AuthProvider
 * A provider component that wraps the application and manages the authentication state.
 *
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered within the provider.
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const isAuthenticated = useRef<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyTokens = async () => {
      try {
        // Attempt to verify the access token first.
        console.log("Backend IP:", process.env.NEXT_PUBLIC_BACKEND_IP);
        const accessRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_IP}/user/verify-token`,
          {
            method: 'POST',
            credentials: 'include', // Send cookies with the request
          },
        );

        // If the access token is valid, mark as authenticated and finish loading.
        if (accessRes.ok) {
          isAuthenticated.current = true;
          setLoading(false);
          return;
        }

        // If access token is invalid, attempt to refresh it using the refresh token.
        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_IP}/user/refresh-token`,
          {
            method: 'POST',
            credentials: 'include',
          },
        );

        // If the refresh token is valid, mark as authenticated.
        if (refreshRes.ok) {
          isAuthenticated.current = true;
        } else {
          // If both tokens are invalid, mark as not authenticated and redirect to home.
          isAuthenticated.current = false;
          router.push('/');
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        isAuthenticated.current = false;
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    verifyTokens();
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @function useAuth
 * A custom hook to easily access the authentication context.
 * @returns {AuthContextType} The authentication context.
 */
export const useAuth = (): AuthContextType => useContext(AuthContext);
