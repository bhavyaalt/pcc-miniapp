'use client';

import { useFarcaster } from '../providers/FarcasterProvider';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function FarcasterConnect() {
  const { isReady, isInFarcaster, user, signIn, isSigningIn } = useFarcaster();

  // If in Farcaster and user is signed in, show their profile
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
      </div>
    );
  }

  // If in Farcaster but not signed in, show sign in button
  if (isInFarcaster && !user) {
    return (
      <button
        onClick={signIn}
        disabled={isSigningIn || !isReady}
        className="bg-[#8B5CF6] text-white rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        {isSigningIn ? 'Signing in...' : 'Sign in'}
      </button>
    );
  }

  // Not in Farcaster, use RainbowKit
  return (
    <ConnectButton.Custom>
      {({ account, openConnectModal, openAccountModal, mounted }) => {
        const connected = mounted && account;
        return connected ? (
          <button 
            onClick={openAccountModal}
            className="flex items-center gap-2 bg-[#1a1a1f] rounded-full pl-3 pr-2 py-1.5"
          >
            <span className="text-sm">{account.displayName}</span>
            <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
          </button>
        ) : (
          <button 
            onClick={openConnectModal}
            className="bg-[#22c55e] text-black rounded-full px-4 py-1.5 text-sm font-medium"
          >
            Connect
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
