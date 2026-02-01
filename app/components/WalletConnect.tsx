'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function WalletConnect() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

export function WalletStatus() {
  const { isConnected, address, chain } = useAccount();

  if (!isConnected) {
    return (
      <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
        <p className="text-zinc-400 text-sm">Connect your wallet to continue</p>
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500">Connected to {chain?.name || 'Unknown'}</p>
          <p className="font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full" />
      </div>
    </div>
  );
}
