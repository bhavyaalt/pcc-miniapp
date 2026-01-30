# PCC Token - Tokenomics Design

## Overview

**$PCC** - The governance and utility token for Peer Credit Circles

Deployed via **Clanker** on Base (Farcaster AI agent token launcher)

---

## How Clanker Works

Clanker is an AI agent on Farcaster that:
1. **Deploys ERC20 tokens** on Base with a single cast
2. **Creates Uniswap V3 liquidity pool** automatically
3. **Locks LP tokens** for ~1000 years (rugproof)
4. **Takes 2.5% protocol fee** on initial buys
5. **LP fees split**: 5% to token creator, 3% to Clanker

**To launch via Clanker:**
- Cast on Farcaster tagging @clanker with token name, symbol, and optional image
- Clanker deploys and replies with contract address
- Instant trading on Uniswap V3

---

## $PCC Token Design

### Supply & Distribution

| Allocation | % | Amount | Purpose |
|------------|---|--------|---------|
| **Liquidity Pool** | 80% | 800,000 | Uniswap V3 trading (locked forever) |
| **Platform Rewards** | 10% | 100,000 | Funders, early adopters, contributors |
| **Team & Development** | 5% | 50,000 | Vested 12 months, monthly unlock |
| **Community Treasury** | 5% | 50,000 | Governance-controlled |

**Total Supply: 1,000,000 $PCC**

### Why This Split?
- **80% LP**: Clanker locks this forever → no rug, deep liquidity
- **10% Rewards**: Distributed based on platform activity (see below)
- **5% Team**: Aligned incentives, 12-month vest
- **5% Treasury**: Future grants, partnerships, emergencies

---

## Utility & Benefits

### 1. **Platform Fee Discounts**
| $PCC Held | Fee Discount |
|-----------|--------------|
| 100+ | 10% off |
| 1,000+ | 25% off |
| 10,000+ | 50% off |

### 2. **Governance Power**
- Vote on protocol parameters (quorum %, approval thresholds)
- Vote on treasury spending
- Propose new features
- 1 $PCC = 1 vote

### 3. **Early Access**
- New pool types (fixed income, venture pools)
- Beta features
- Premium analytics

### 4. **Staking Rewards**
- Stake $PCC → earn share of platform fees
- Fee distribution: 70% to pool members, 30% to $PCC stakers
- Longer stake = higher multiplier (1x → 2x over 1 year)

---

## Earning $PCC

### For Funders (Depositing into Pools)
| Action | Reward |
|--------|--------|
| First deposit into any pool | 10 $PCC |
| Deposit $100+ | 5 $PCC |
| Deposit $1,000+ | 25 $PCC |
| Deposit $10,000+ | 100 $PCC |
| Monthly active (vote or propose) | 2 $PCC |

### For Builders (Creating Pools)
| Action | Reward |
|--------|--------|
| Create first pool | 50 $PCC |
| Pool reaches 5 members | 25 $PCC |
| Pool reaches $10k TVL | 100 $PCC |
| Pool reaches $100k TVL | 500 $PCC |

### For Community
| Action | Reward |
|--------|--------|
| Refer new user who deposits | 5 $PCC |
| Bug report (valid) | 20-100 $PCC |
| Feature contribution (merged) | 50-500 $PCC |

---

## Feature Building with $PCC

Token holders can propose and fund new features:

### Proposal Flow
1. **Submit Proposal**: 100 $PCC stake required (returned if approved)
2. **Community Vote**: 7 days, needs 10% quorum + 60% approval
3. **Build Phase**: Funded from treasury or community bounty
4. **Launch**: Feature goes live, proposer earns bonus

### Example Features to Fund
- Mobile app development
- New pool types (NFT collateral, streaming payments)
- Chain expansion (Arbitrum, Optimism)
- Fiat on-ramp integration
- Analytics dashboard

---

## Clanker Launch Strategy

### Pre-Launch (Before Clanker Cast)
1. ✅ Build core PCC miniapp
2. ✅ Deploy Pool contracts on Base
3. 🔲 Create $PCC token image/branding
4. 🔲 Set up reward distribution contract
5. 🔲 Prepare announcement content

### Launch Day
1. **Cast on Farcaster**: "@clanker deploy $PCC - Peer Credit Circles governance token" + image
2. **Clanker deploys** → get contract address
3. **Announce** on Twitter, Discord, Telegram
4. **Seed liquidity** via initial buy

### Post-Launch
1. Integrate $PCC into PCC miniapp
2. Enable staking
3. Start reward distribution
4. Build governance UI

---

## Technical Implementation

### Reward Distribution Contract
```solidity
// RewardDistributor.sol
contract PCCRewards {
    IERC20 public pccToken;
    mapping(address => uint256) public claimable;
    
    function recordDeposit(address user, uint256 amount) external;
    function recordPoolCreation(address creator) external;
    function claim() external;
}
```

### Staking Contract
```solidity
// PCCStaking.sol
contract PCCStaking {
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 multiplier; // 1x → 2x over 1 year
    }
    
    function stake(uint256 amount) external;
    function unstake() external;
    function claimRewards() external;
}
```

### Governance (Simple Snapshot-style)
- Off-chain voting via Snapshot.org
- On-chain execution for treasury actions
- Timelock for security

---

## Roadmap

### Phase 1: Launch (Week 1-2)
- [x] Finalize tokenomics
- [ ] Create token branding
- [ ] Deploy via Clanker
- [ ] Basic staking contract

### Phase 2: Integration (Week 3-4)
- [ ] Integrate $PCC into miniapp
- [ ] Reward distribution live
- [ ] Fee discount system

### Phase 3: Governance (Month 2)
- [ ] Snapshot space setup
- [ ] First community proposals
- [ ] Treasury governance

### Phase 4: Growth (Month 3+)
- [ ] Major feature proposals
- [ ] Partnerships
- [ ] Cross-chain expansion

---

## Key Metrics to Track

- **Holders**: Target 1,000+ in first month
- **Staked %**: Target 30%+ staked
- **Governance Participation**: Target 10%+ voting
- **Platform TVL**: Correlated with token value

---

## Summary

$PCC is designed to:
1. **Reward early adopters** who fund and build on the platform
2. **Align incentives** between users, builders, and token holders
3. **Enable community governance** of protocol parameters
4. **Create sustainable value** through fee sharing

Clanker deployment = instant liquidity, locked LP, no rug risk.

---

*Questions? Let's iterate on this design before launch!*
