'use client';

import { createContext, useContext, useEffect, useState, useRef, RefObject } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  isAuthenticated: RefObject<boolean>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: {current : false},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useRef<boolean>(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    //console.log("AUTH PROVIDER RAN");
    const verifyTokens = async () => {
      try {
        const accessRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/verify-token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (accessRes.ok) {
          // setIsAuthenticated(true);
          isAuthenticated.current = true;
          setLoading(false);
          return;
        }

        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/user/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (refreshRes.ok) {
          isAuthenticated.current = true;
        } else {
          isAuthenticated.current = false;
          router.push('/');
          //console.log("first one")
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        isAuthenticated.current = false;
        router.push('/');
        //console.log("second one")
      } finally {
        setLoading(false);
      }
    };

    verifyTokens();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
