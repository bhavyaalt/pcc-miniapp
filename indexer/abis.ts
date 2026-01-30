// Contract ABIs for indexer (events only)

export const POOL_FACTORY_ABI = [
  {
    type: 'event',
    name: 'PoolCreated',
    inputs: [
      { name: 'pool', type: 'address', indexed: true },
      { name: 'admin', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'getAllPools',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
] as const;

export const POOL_ABI = [
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
    name: 'MemberWhitelisted',
    inputs: [
      { name: 'member', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'GuardianAdded',
    inputs: [
      { name: 'guardian', type: 'address', indexed: true },
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
  {
    type: 'event',
    name: 'RequestApproved',
    inputs: [
      { name: 'requestId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'RequestRejected',
    inputs: [
      { name: 'requestId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'RequestFunded',
    inputs: [
      { name: 'requestId', type: 'uint256', indexed: true },
      { name: 'requester', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'GuardianApproval',
    inputs: [
      { name: 'requestId', type: 'uint256', indexed: true },
      { name: 'guardian', type: 'address', indexed: true },
    ],
  },
  // Read functions for fetching pool data
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
    name: 'admin',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
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
] as const;

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
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
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;
