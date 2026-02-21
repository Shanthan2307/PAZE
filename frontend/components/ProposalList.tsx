'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../lib/contract';
import { ethers } from 'ethers';
import PredictionMarket from './PredictionMarket';
import LaunchPredictionMarket from './LaunchPredictionMarket';
import { marketStore } from '../lib/marketStore';

interface Proposal {
  id: string;
  description: string;
  forVotes: number;
  againstVotes: number;
  deadline: number;
  executed: boolean;
  exists: boolean;
  ipfsLink?: string;
  location?: string;
  category?: string;
  urgency?: string;
  impactScore?: number;
  hasPredictionMarket?: boolean;
  predictionMarket?: {
    yesPrice: number;
    noPrice: number;
    totalVolume: number;
    yesShares: number;
    noShares: number;
  };
}

export default function ProposalList() {
  const { address } = useAccount();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const [, setMarketUpdate] = useState(0); // Force re-render when markets change

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user is a member
  const { data: isMember } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isMember',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    loadProposals();
    
    // Subscribe to market store updates
    const unsubscribe = marketStore.subscribe(() => {
      setMarketUpdate(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  async function loadProposals() {
    try {
      setLoading(true);
      
      // Fetch proposals directly from blockchain events
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_DAO_CHAIN_RPC_URL || 'https://rpc.ab.testnet.adifoundation.ai/');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Get ProposalCreated events
      const filter = contract.filters.ProposalCreated();
      const events = await contract.queryFilter(filter, 0, 'latest');
      
      // Extract proposal IDs from events
      const proposalIds = events.map(event => ({
        proposalId: event.args?.[0] as string,
        ipfsCID: undefined // We'll get this from the contract
      }));
      
      console.log(`Found ${proposalIds.length} proposals from blockchain events`);
      
      if (proposalIds.length > 0) {
        await fetchProposalDetails(proposalIds);
      } else {
        setProposals([]);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProposalDetails(proposalIds: Array<{proposalId: string, ipfsCID?: string}>) {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_DAO_CHAIN_RPC_URL || 'https://rpc.ab.testnet.adifoundation.ai/');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const proposalPromises = proposalIds.map(async ({proposalId, ipfsCID}) => {
      try {
        // Use new PredictionMarketDAO functions
        const [details, voting, metadata] = await Promise.all([
          contract.getProposalDetails(proposalId),
          contract.getProposalVoting(proposalId),
          contract.getProposalMetadata(proposalId)
        ]);
        
        // Check if proposal exists (status !== 0 means it exists)
        if (metadata[10] === 0) { // status field
          console.log(`Proposal ${proposalId} does not exist on-chain, skipping...`);
          return null;
        }
        
        const title = details[0];
        const description = details[1];
        const location = details[2];
        const requestedAmount = details[5];
        
        const forVotes = Number(voting[0]);
        const againstVotes = Number(voting[1]);
        const deadline = Number(voting[2]);
        const executed = voting[3];
        
        const issueType = Number(metadata[3]);
        const severity = Number(metadata[4]);
        const ipfsCID_onchain = metadata[7];
        
        // Map issue types
        const issueTypeMap = ['Environmental', 'Infrastructure', 'Healthcare', 'Education', 'Humanitarian', 'Social', 'Economic'];
        const severityMap = ['Low', 'Medium', 'High', 'Critical'];
        
        // Check if market exists for this proposal
        const existingMarket = marketStore.getMarketByProposalId(proposalId);
        
        return {
          id: proposalId,
          description: `${title}\n\n${description}`,
          forVotes,
          againstVotes,
          deadline,
          executed,
          exists: true,
          ipfsLink: ipfsCID_onchain ? `https://gateway.pinata.cloud/ipfs/${ipfsCID_onchain}` : (ipfsCID ? `https://gateway.pinata.cloud/ipfs/${ipfsCID}` : undefined),
          location,
          category: issueTypeMap[issueType] || 'Unknown',
          urgency: severityMap[severity] || 'Unknown',
          impactScore: Number(metadata[2]), // verificationConfidence
          hasPredictionMarket: !!existingMarket,
          predictionMarket: existingMarket ? {
            yesPrice: existingMarket.yesPrice,
            noPrice: existingMarket.noPrice,
            totalVolume: existingMarket.totalVolume,
            yesShares: existingMarket.yesShares,
            noShares: existingMarket.noShares,
          } : undefined,
        };
      } catch (error) {
        console.log(`Skipping proposal ${proposalId} - not found on-chain or error occurred`);
        return null;
      }
    });

    const results = await Promise.all(proposalPromises);
    setProposals(results.filter((p) => p !== null && p.exists) as Proposal[]);
  }

  async function handleVote(proposalId: string, support: boolean) {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'vote',
        args: [proposalId as `0x${string}`, support],
      });
    } catch (err) {
      console.error('Error voting:', err);
    }
  }

  async function handleExecute(proposalId: string) {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'executeProposal',
        args: [proposalId as `0x${string}`],
      });
    } catch (err) {
      console.error('Error executing:', err);
    }
  }

  function getTimeRemaining(deadline: number): string {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  }

  function getStatusColor(proposal: Proposal): string {
    if (proposal.executed) return 'bg-green-100 text-green-800 border border-green-200';
    
    const now = Math.floor(Date.now() / 1000);
    if (proposal.deadline < now) return 'bg-gray-100 text-gray-700 border border-gray-200';
    
    return 'bg-blue-100 text-blue-800 border border-blue-200';
  }

  function getStatusText(proposal: Proposal): string {
    if (proposal.executed) return '✅ Executed';
    
    const now = Math.floor(Date.now() / 1000);
    if (proposal.deadline < now) {
      if (proposal.forVotes > proposal.againstVotes) return '⏳ Ready to Execute';
      return '❌ Rejected';
    }
    
    return '🗳️ Active';
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading proposals...</p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No active proposals found
        </h3>
        <p className="text-gray-600 mb-6">
          Proposals are created automatically when high-impact initiatives are identified by our AI agents.
        </p>
        <button
          onClick={loadProposals}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          All Proposals ({proposals.length})
        </h3>
        <button
          onClick={loadProposals}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-200 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {!isMember && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ℹ️ You need to be a DAO member to vote on proposals. Go to the "Home" tab to join.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal)}`}>
                    {getStatusText(proposal)}
                  </span>
                  {proposal.urgency && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      proposal.urgency.toLowerCase() === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                      proposal.urgency.toLowerCase() === 'medium' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {proposal.urgency} Urgency
                    </span>
                  )}
                </div>
                
                {proposal.location && (
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    📍 {proposal.location}
                  </h4>
                )}
                
                {proposal.category && (
                  <p className="text-sm text-gray-600 mb-1">
                    Category: {proposal.category}
                  </p>
                )}
                
                {proposal.impactScore !== undefined && proposal.impactScore > 0 && (
                  <p className="text-sm text-gray-600">
                    Impact Score: <span className="font-semibold text-gray-900">{proposal.impactScore}</span>
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {getTimeRemaining(proposal.deadline)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <button
                onClick={() => setSelectedProposal(selectedProposal === proposal.id ? null : proposal.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                {selectedProposal === proposal.id ? '▼ Hide Details' : '▶ Show Details'}
              </button>
              
              {selectedProposal === proposal.id && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {proposal.description}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">For: {proposal.forVotes}</span>
                  <span className="text-gray-600">Against: {proposal.againstVotes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${proposal.forVotes + proposal.againstVotes > 0 
                        ? (proposal.forVotes / (proposal.forVotes + proposal.againstVotes)) * 100 
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {proposal.ipfsLink && (
                <a
                  href={proposal.ipfsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-200 transition-colors"
                >
                  📄 View on IPFS
                </a>
              )}

              {/* Prediction Market Button */}
              {!proposal.hasPredictionMarket && isMember && !proposal.executed && (
                <LaunchPredictionMarket
                  proposalId={proposal.id}
                  proposalTitle={proposal.location || 'Proposal'}
                  proposalDescription={proposal.description}
                  proposalImageUrl={proposal.ipfsLink}
                  proposalDeadline={proposal.deadline}
                  proposalCategory={proposal.category}
                  onSuccess={() => loadProposals()}
                />
              )}

              {proposal.hasPredictionMarket && (
                <button
                  onClick={() => setExpandedMarket(expandedMarket === proposal.id ? null : proposal.id)}
                  className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 border border-purple-200 transition-colors font-medium"
                >
                  {expandedMarket === proposal.id ? '📊 Hide Market' : '📊 View Prediction Market'}
                </button>
              )}
              
              {isMember && !proposal.executed && proposal.deadline > Math.floor(Date.now() / 1000) && (
                <>
                  <button
                    onClick={() => handleVote(proposal.id, true)}
                    disabled={isPending || isConfirming}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    👍 Vote For
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, false)}
                    disabled={isPending || isConfirming}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    👎 Vote Against
                  </button>
                </>
              )}
              
              {isMember && !proposal.executed && proposal.deadline < Math.floor(Date.now() / 1000) && proposal.forVotes > proposal.againstVotes && (
                <button
                  onClick={() => handleExecute(proposal.id)}
                  disabled={isPending || isConfirming}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  ⚡ Execute Proposal
                </button>
              )}
            </div>

            {/* Prediction Market Expanded View */}
            {expandedMarket === proposal.id && proposal.hasPredictionMarket && proposal.predictionMarket && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PredictionMarket
                  proposalId={proposal.id}
                  title={proposal.location || 'Prediction Market'}
                  description={`Will this proposal be successfully completed within the specified timeframe?`}
                  imageUrl={proposal.ipfsLink}
                  deadline={proposal.deadline}
                  yesPrice={proposal.predictionMarket.yesPrice}
                  noPrice={proposal.predictionMarket.noPrice}
                  totalVolume={proposal.predictionMarket.totalVolume}
                  yesShares={proposal.predictionMarket.yesShares}
                  noShares={proposal.predictionMarket.noShares}
                />
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-mono">
                Proposal ID: {proposal.id.slice(0, 10)}...{proposal.id.slice(-8)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            Error: {error.message}
          </p>
        </div>
      )}

      {isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ Transaction successful!
          </p>
          <p className="text-green-700 text-sm mt-1 font-mono">
            Transaction: {hash?.slice(0, 10)}...{hash?.slice(-8)}
          </p>
        </div>
      )}
    </div>
  );
}
