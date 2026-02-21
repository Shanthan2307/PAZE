export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x033480cD0519B7e5b2AAcd64F7B5C018FbeEC20A') as `0x${string}`;

// PredictionMarketDAO ABI - Updated for new contract
export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'member', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'stake', type: 'uint256' },
    ],
    name: 'MemberJoined',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'member', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'stake', type: 'uint256' },
    ],
    name: 'MemberLeft',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { indexed: false, internalType: 'string', name: 'description', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
    ],
    name: 'ProposalExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'support', type: 'bool' },
    ],
    name: 'Voted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'joinDAO',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'leaveDAO',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { internalType: 'bool', name: 'support', type: 'bool' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'executeProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // New PredictionMarketDAO functions
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'getProposalDetails',
    outputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'string', name: 'location', type: 'string' },
      { internalType: 'int256', name: 'latitude', type: 'int256' },
      { internalType: 'int256', name: 'longitude', type: 'int256' },
      { internalType: 'uint256', name: 'requestedAmount', type: 'uint256' },
      { internalType: 'address', name: 'beneficiary', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'getProposalMetadata',
    outputs: [
      { internalType: 'bytes32', name: 'propertyId', type: 'bytes32' },
      { internalType: 'bytes32', name: 'evidenceHash', type: 'bytes32' },
      { internalType: 'uint8', name: 'verificationConfidence', type: 'uint8' },
      { internalType: 'uint8', name: 'issueType', type: 'uint8' },
      { internalType: 'uint8', name: 'severity', type: 'uint8' },
      { internalType: 'bytes32', name: 'marketId', type: 'bytes32' },
      { internalType: 'uint256', name: 'resolutionDeadline', type: 'uint256' },
      { internalType: 'string', name: 'ipfsCID', type: 'string' },
      { internalType: 'address', name: 'proposer', type: 'address' },
      { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
      { internalType: 'uint8', name: 'status', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'getProposalVoting',
    outputs: [
      { internalType: 'uint256', name: 'forVotes', type: 'uint256' },
      { internalType: 'uint256', name: 'againstVotes', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'bool', name: 'executed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'proposalId', type: 'bytes32' },
      { internalType: 'address', name: 'voter', type: 'address' },
    ],
    name: 'hasVoted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'member', type: 'address' }],
    name: 'getMemberStake',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MINIMUM_STAKE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VOTING_PERIOD',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'QUORUM',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
