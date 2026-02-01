'use client';

import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custody?: string;
}

interface FarcasterContextType {
  isReady: boolean;
  isInFarcaster: boolean;
  user: FarcasterUser | null;
  signIn: () => Promise<void>;
  isSigningIn: boolean;
  error: string | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isReady: false,
  isInFarcaster: false,
  user: null,
  signIn: async () => {},
  isSigningIn: false,
  error: null,
});

export function useFarcaster() {
  return useContext(FarcasterContext);
}

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK
  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're in a Farcaster client
        if (typeof window !== 'undefined' && window.parent !== window) {
          // Likely in an iframe (Farcaster client)
          const context = await sdk.context;
          
          if (context?.user) {
            setIsInFarcaster(true);
            setUser({
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
            });
          }
        }
      } catch (err) {
        console.log('Not in Farcaster context:', err);
      } finally {
        setIsReady(true);
        // Tell Farcaster client we're ready
        try {
          sdk.actions.ready();
        } catch {
          // Not in Farcaster
        }
      }
    };

    init();
  }, []);

  const signIn = useCallback(async () => {
    if (!isInFarcaster) {
      setError('Not in Farcaster client');
      return;
    }

    try {
      setIsSigningIn(true);
      setError(null);

      const result = await sdk.actions.signIn({
        nonce: Math.random().toString(36).substring(2),
      });

      if (result) {
        // Re-fetch context after sign in
        const context = await sdk.context;
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
        }
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsSigningIn(false);
    }
  }, [isInFarcaster]);

  return (
    <FarcasterContext.Provider
      value={{
        isReady,
        isInFarcaster,
        user,
        signIn,
        isSigningIn,
        error,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
}
