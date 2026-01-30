// Contract addresses and ABIs for PCC

export const CHAIN_ID = 84532; // Base Sepolia

export const CONTRACTS = {
  POOL_FACTORY: '0x3A15E25Fed95d1092F593aD72B395835edec8ce6' as const,
  // USDC on Base Sepolia (we'll use a mock for now)
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const, // Circle's USDC on Base Sepolia
};

// PoolFactory ABI (essential functions)
export const POOL_FACTORY_ABI = [
  {
    type: 'function',
    name: 'createPool',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'depositToken', type: 'address' },
      { name: 'minDeposit', type: 'uint256' },
      { name: 'votingPeriod', type: 'uint256' },
      { name: 'quorumBps', type: 'uint256' },
      { name: 'approvalThresholdBps', type: 'uint256' },
      { name: 'guardianThresholdBps', type: 'uint256' },
      { name: 'guardians', type: 'address[]' },
    ],
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAllPools',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPoolCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserPools',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isPool',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'PoolCreated',
    inputs: [
      { name: 'pool', type: 'address', indexed: true },
      { name: 'admin', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
    ],
  },
] as const;

// Pool ABI (essential functions)
export const POOL_ABI = [
  // Read functions
  {
    type: 'function',
    name: 'config',
    inputs: [],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'depositToken', type: 'address' },
      { name: 'minDeposit', type: 'uint256' },
      { name: 'votingPeriod', type: 'uint256' },
      { name: 'quorumBps', type: 'uint256' },
      { name: 'approvalThresholdBps', type: 'uint256' },
      { name: 'guardianThresholdBps', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalDeposited',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'shareToken',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'admin',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'members',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'isActive', type: 'bool' },
      { name: 'isGuardian', type: 'bool' },
      { name: 'joinedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'whitelist',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nextRequestId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRequest',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'requester', type: 'address' },
          { name: 'title', type: 'string' },
          { name: 'descriptionUri', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'requestType', type: 'uint8' },
          { name: 'rewardBps', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
          { name: 'collateralAmount', type: 'uint256' },
          { name: 'collateralToken', type: 'address' },
          { name: 'status', type: 'uint8' },
          { name: 'votingEndsAt', type: 'uint256' },
          { name: 'yesVotes', type: 'uint256' },
          { name: 'noVotes', type: 'uint256' },
          { name: 'fundedAt', type: 'uint256' },
          { name: 'repaidAmount', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasVoted',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'addToWhitelist',
    inputs: [{ name: 'member', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createRequest',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'descriptionUri', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'requestType', type: 'uint8' },
      { name: 'rewardBps', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
      { name: 'collateralToken', type: 'address' },
      { name: 'collateralAmount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'vote',
    inputs: [
      { name: 'requestId', type: 'uint256' },
      { name: 'support', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'finalizeVoting',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeRequest',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveAsGuardian',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      { name: 'member', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'shares', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Withdrawn',
    inputs: [
      { name: 'member', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'shares', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'RequestCreated',
    inputs: [
      { name: 'requestId', type: 'uint256', indexed: true },
      { name: 'requester', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'requestType', type: 'uint8', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'VoteCast',
    inputs: [
      { name: 'requestId', type: 'uint256', indexed: true },
      { name: 'voter', type: 'address', indexed: true },
      { name: 'support', type: 'bool', indexed: false },
      { name: 'weight', type: 'uint256', indexed: false },
    ],
  },
] as const;

// ERC20 ABI for token approvals
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;

// Request status enum
export enum RequestStatus {
  PENDING = 0,
  VOTING = 1,
  APPROVED = 2,
  REJECTED = 3,
  FUNDED = 4,
  COMPLETED = 5,
  DEFAULTED = 6,
  CANCELLED = 7,
}

// Request type enum
export enum RequestType {
  GRANT = 0,
  LOAN = 1,
  INVESTMENT = 2,
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'Pending',
  [RequestStatus.VOTING]: 'Voting',
  [RequestStatus.APPROVED]: 'Approved',
  [RequestStatus.REJECTED]: 'Rejected',
  [RequestStatus.FUNDED]: 'Funded',
  [RequestStatus.COMPLETED]: 'Completed',
  [RequestStatus.DEFAULTED]: 'Defaulted',
  [RequestStatus.CANCELLED]: 'Cancelled',
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  [RequestType.GRANT]: 'Grant',
  [RequestType.LOAN]: 'Loan',
  [RequestType.INVESTMENT]: 'Investment',
};
