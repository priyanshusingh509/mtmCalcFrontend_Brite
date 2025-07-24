'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * A client-side component that protects routes from unauthenticated access.
 * It checks the user's authentication status and redirects to the home page if they are not logged in.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if the user is authenticated.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Get authentication status and loading state from the AuthContext
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Effect to handle redirection based on authentication status
  useEffect(() => {
    // If loading is finished and the user is not authenticated, redirect to the home page
    if (!loading && !isAuthenticated.current) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  // While authentication status is being determined, show nothing (or a loading spinner)
  if (loading) {
    return null; // Or replace with a loading spinner component for better UX
  }

  // If the user is not authenticated, render nothing, as the redirect is in progress
  if (!isAuthenticated.current) {
    return null;
  }

  // If the user is authenticated, render the child components
  return <>{children}</>;
}

