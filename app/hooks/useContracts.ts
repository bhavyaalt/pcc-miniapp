'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import {
  CONTRACTS,
  POOL_FACTORY_ABI,
  POOL_ABI,
  ERC20_ABI,
  RequestStatus,
  RequestType,
} from '../lib/contracts';

// ============================================
// POOL FACTORY HOOKS
// ============================================

export function usePoolCount() {
  return useReadContract({
    address: CONTRACTS.POOL_FACTORY,
    abi: POOL_FACTORY_ABI,
    functionName: 'getPoolCount',
  });
}

export function useAllPools() {
  return useReadContract({
    address: CONTRACTS.POOL_FACTORY,
    abi: POOL_FACTORY_ABI,
    functionName: 'getAllPools',
  });
}

export function useUserPools(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.POOL_FACTORY,
    abi: POOL_FACTORY_ABI,
    functionName: 'getUserPools',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

export function useCreatePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createPool = async (params: {
    name: string;
    depositToken: `0x${string}`;
    minDeposit: bigint;
    votingPeriod: bigint;
    quorumBps: bigint;
    approvalThresholdBps: bigint;
    guardianThresholdBps: bigint;
    guardians: `0x${string}`[];
  }) => {
    writeContract({
      address: CONTRACTS.POOL_FACTORY,
      abi: POOL_FACTORY_ABI,
      functionName: 'createPool',
      args: [
        params.name,
        params.depositToken,
        params.minDeposit,
        params.votingPeriod,
        params.quorumBps,
        params.approvalThresholdBps,
        params.guardianThresholdBps,
        params.guardians,
      ],
    });
  };

  return { createPool, hash, isPending, isConfirming, isSuccess, error };
}

// ============================================
// POOL HOOKS
// ============================================

export function usePoolConfig(poolAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'config',
    query: { enabled: !!poolAddress },
  });
}

export function usePoolTotalDeposited(poolAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'totalDeposited',
    query: { enabled: !!poolAddress },
  });
}

export function usePoolAdmin(poolAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'admin',
    query: { enabled: !!poolAddress },
  });
}

export function usePoolShareToken(poolAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'shareToken',
    query: { enabled: !!poolAddress },
  });
}

export function useMemberInfo(poolAddress: `0x${string}` | undefined, memberAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'members',
    args: memberAddress ? [memberAddress] : undefined,
    query: { enabled: !!poolAddress && !!memberAddress },
  });
}

export function useIsWhitelisted(poolAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'whitelist',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!poolAddress && !!userAddress },
  });
}

export function useShareBalance(shareTokenAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: shareTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!shareTokenAddress && !!userAddress },
  });
}

// ============================================
// POOL WRITE HOOKS
// ============================================

export function useDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (poolAddress: `0x${string}`, amount: bigint) => {
    writeContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'deposit',
      args: [amount],
    });
  };

  return { deposit, hash, isPending, isConfirming, isSuccess, error };
}

export function useWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = (poolAddress: `0x${string}`, amount: bigint) => {
    writeContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'withdraw',
      args: [amount],
    });
  };

  return { withdraw, hash, isPending, isConfirming, isSuccess, error };
}

export function useAddToWhitelist() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addToWhitelist = (poolAddress: `0x${string}`, memberAddress: `0x${string}`) => {
    writeContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'addToWhitelist',
      args: [memberAddress],
    });
  };

  return { addToWhitelist, hash, isPending, isConfirming, isSuccess, error };
}

export function useCreateRequest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createRequest = (
    poolAddress: `0x${string}`,
    params: {
      title: string;
      descriptionUri: string;
      amount: bigint;
      requestType: RequestType;
      rewardBps: bigint;
      duration: bigint;
      collateralToken: `0x${string}`;
      collateralAmount: bigint;
    }
  ) => {
    writeContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'createRequest',
      args: [
        params.title,
        params.descriptionUri,
        params.amount,
        params.requestType,
        params.rewardBps,
        params.duration,
        params.collateralToken,
        params.collateralAmount,
      ],
    });
  };

  return { createRequest, hash, isPending, isConfirming, isSuccess, error };
}

export function useVote() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const vote = (poolAddress: `0x${string}`, requestId: bigint, support: boolean) => {
    writeContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'vote',
      args: [requestId, support],
    });
  };

  return { vote, hash, isPending, isConfirming, isSuccess, error };
}

export function useFinalizeVoting() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const finalizeVoting = (poolAddress: `0x${string}`, requestId: bigint) => {
    writeContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'finalizeVoting',
      args: [requestId],
    });
  };

  return { finalizeVoting, hash, isPending, isConfirming, isSuccess, error };
}

export function useExecuteRequest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const executeRequest = (poolAddress: `0x${string}`, requestId: bigint) => {
    writeContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'executeRequest',
      args: [requestId],
    });
  };

  return { executeRequest, hash, isPending, isConfirming, isSuccess, error };
}

// ============================================
// ERC20 HOOKS
// ============================================

export function useTokenBalance(tokenAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!tokenAddress && !!userAddress },
  });
}

export function useTokenAllowance(
  tokenAddress: `0x${string}` | undefined,
  ownerAddress: `0x${string}` | undefined,
  spenderAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    query: { enabled: !!tokenAddress && !!ownerAddress && !!spenderAddress },
  });
}

export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (tokenAddress: `0x${string}`, spenderAddress: `0x${string}`, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amount],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

// ============================================
// REQUEST HOOKS
// ============================================

export function useNextRequestId(poolAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'nextRequestId',
    query: { enabled: !!poolAddress },
  });
}

export function useRequest(poolAddress: `0x${string}` | undefined, requestId: bigint | undefined) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'getRequest',
    args: requestId !== undefined ? [requestId] : undefined,
    query: { enabled: !!poolAddress && requestId !== undefined },
  });
}

export function useHasVoted(
  poolAddress: `0x${string}` | undefined,
  requestId: bigint | undefined,
  voterAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'hasVoted',
    args: requestId !== undefined && voterAddress ? [requestId, voterAddress] : undefined,
    query: { enabled: !!poolAddress && requestId !== undefined && !!voterAddress },
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  return formatUnits(amount, decimals);
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  return parseUnits(amount, decimals);
}
