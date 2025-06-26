'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyTokens = async () => {
      try {
        const accessRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/verify-token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (accessRes.ok) {
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    verifyTokens();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
