'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  RefObject,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

/**
 * @interface AuthContextType
 * Defines the shape of the authentication context data.
 */
interface AuthContextType {
  /**
   * A ref object holding the user's authentication status.
   * Using a ref avoids re-rendering components that consume the context
   * every time the value changes. Components should use the `loading`
   * state to react to authentication status updates.
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
 * It verifies the user's tokens on initial load and provides the auth status
 * and loading state to all descendant components.
 *
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered within the provider.
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // A ref to store the authentication status without causing re-renders on change.
  const isAuthenticated = useRef<boolean>(false);
  // State to track the loading status of the authentication check.
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Effect to verify user's authentication status on component mount.
  useEffect(() => {
    const verifyTokens = async () => {
      try {
        // Attempt to verify the access token first.
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
        // Ensure loading is set to false after the check is complete.
        setLoading(false);
      }
    };

    verifyTokens();
    // The dependency array is empty to ensure this effect runs only once on mount.
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
export const useAuth = () => useContext(AuthContext);
