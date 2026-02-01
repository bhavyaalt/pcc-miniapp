'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export function useFarcasterContext() {
  const [isInFarcaster, setIsInFarcaster] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkContext = async () => {
      try {
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
      } catch (e) {
        // Not in Farcaster context
        setIsInFarcaster(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkContext();
  }, []);

  return { isInFarcaster, user, isLoading };
}
