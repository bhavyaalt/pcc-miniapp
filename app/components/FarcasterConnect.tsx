'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect, useState } from 'react';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export function FarcasterConnect() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);

  useEffect(() => {
    // Check if we're in a Farcaster frame
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
      }
    };
    checkContext();
  }, []);

  // If in Farcaster and has user context, show their profile
  if (isInFarcaster && user) {
    return (
      <div className="flex items-center gap-2 bg-[#1a1a1f] rounded-full pl-3 pr-2 py-1.5">
        {user.pfpUrl && (
          <img 
            src={user.pfpUrl} 
            alt="" 
            className="w-6 h-6 rounded-full"
          />
        )}
        <span className="text-sm">{user.displayName || `@${user.username}`}</span>
        {isConnected && address && (
          <span className="text-xs text-zinc-500 ml-1">
            {address.slice(0, 4)}...{address.slice(-3)}
          </span>
        )}
      </div>
    );
  }

  // Show wallet connection status
  if (isConnected && address) {
    return (
      <button 
        onClick={() => disconnect()}
        className="flex items-center gap-2 bg-[#1a1a1f] rounded-full pl-3 pr-2 py-1.5"
      >
        <span className="text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
        <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center">
          <span className="text-xs">👤</span>
        </div>
      </button>
    );
  }

  // Not connected, show connect button
  return (
    <button 
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-50"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
