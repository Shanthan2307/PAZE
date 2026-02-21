'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';

interface CreateProposalFormProps {
  onSuccess?: () => void;
}

export default function CreateProposalForm({ onSuccess }: CreateProposalFormProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [imageUrl, setImageUrl] = useState('');
  const [analysisUrl, setAnalysisUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);

  // Check membership status when wallet connects
  useEffect(() => {
    async function checkMembership() {
      if (!isConnected || !walletClient || !address) {
        setIsMember(null);
        return;
      }

      setCheckingMembership(true);
      try {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x033480cD0519B7e5b2AAcd64F7B5C018FbeEC20A';
        const contractABI = ["function isMember(address account) external view returns (bool)"];
        
        const provider = new ethers.BrowserProvider(walletClient as any);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        const memberStatus = await contract.isMember(address);
        setIsMember(memberStatus);
      } catch (err) {
        console.error('Error checking membership:', err);
        setIsMember(null);
      } finally {
        setCheckingMembership(false);
      }
    }

    checkMembership();
  }, [isConnected, walletClient, address]);

  const extractCID = (url: string): string | null => {
    // Extract CID from various Pinata URL formats
    const patterns = [
      /ipfs\/(Qm[a-zA-Z0-9]{44}|baf[a-zA-Z0-9]+)/,
      /gateway\.pinata\.cloud\/ipfs\/([a-zA-Z0-9]+)/,
      /(Qm[a-zA-Z0-9]{44}|baf[a-zA-Z0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!isConnected || !walletClient) {
        throw new Error('Please connect your wallet first');
      }

      // Validate URLs
      const imageCID = extractCID(imageUrl);
      const analysisCID = extractCID(analysisUrl);

      if (!imageCID) {
        throw new Error('Invalid image Pinata URL. Please provide a valid IPFS link.');
      }

      if (!analysisCID) {
        throw new Error('Invalid analysis Pinata URL. Please provide a valid IPFS link.');
      }

      // Fetch and format proposal data from API
      const response = await fetch('/api/prepare-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageCID,
          analysisCID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to prepare proposal');
      }

      // Now create proposal using user's wallet
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x033480cD0519B7e5b2AAcd64F7B5C018FbeEC20A';
      const contractABI = [
        "function createProposal(string calldata description) external returns (bytes32)",
        "function isMember(address account) external view returns (bool)",
        "function joinDAO() external payable"
      ];

      // Create ethers provider from wagmi wallet client
      const provider = new ethers.BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Check if user is a member first
      const userAddress = await signer.getAddress();
      const isMember = await contract.isMember(userAddress);
      
      if (!isMember) {
        throw new Error('You must join the DAO first. Go to the "Voting (DAO)" tab and click "Join DAO".');
      }

      // Send transaction via MetaMask
      try {
        const tx = await contract.createProposal(data.description);
        setSuccess(`Transaction sent! Waiting for confirmation...\nTX: ${tx.hash}`);
        
        const receipt = await tx.wait();
        
        // Extract proposal ID from event
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === 'ProposalCreated';
          } catch {
            return false;
          }
        });

        let proposalId = 'Unknown';
        if (event) {
          const parsed = contract.interface.parseLog(event);
          proposalId = parsed?.args?.[0] || 'Unknown';
        }

        setSuccess(`✅ Proposal created successfully!\nProposal ID: ${proposalId}\nTransaction: ${tx.hash}`);
        setImageUrl('');
        setAnalysisUrl('');
        
        if (onSuccess) {
          setTimeout(onSuccess, 3000);
        }
      } catch (txError: any) {
        // Try to get more specific error information
        if (txError.message?.includes('Proposal already exists')) {
          throw new Error('This proposal already exists. The description must be unique.');
        } else if (txError.code === 'CALL_EXCEPTION') {
          throw new Error('Transaction failed. This might be because:\n- The proposal description is not unique\n- Network congestion\n- Try refreshing and submitting again');
        } else {
          throw txError;
        }
      }
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      let errorMessage = 'An error occurred';
      
      if (err.message?.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Create New Proposal</h2>
      <p className="text-gray-600 mb-6">
        Submit Pinata URLs for the image and analysis to create a DAO proposal automatically.
      </p>

      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please connect your wallet to create proposals
          </p>
        </div>
      )}

      {isConnected && checkingMembership && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🔍 Checking DAO membership...
          </p>
        </div>
      )}

      {isConnected && !checkingMembership && isMember === false && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-3">
            ❌ You are not a DAO member. You must join the DAO before creating proposals.
          </p>
          <button
            onClick={() => window.location.href = '#voting'}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Go to Voting Tab to Join DAO
          </button>
        </div>
      )}

      {isConnected && !checkingMembership && isMember === true && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ You are a DAO member and can create proposals
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image URL Input */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Image Pinata URL
          </label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://gateway.pinata.cloud/ipfs/Qm..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste the Pinata IPFS URL for the image
          </p>
        </div>

        {/* Analysis URL Input */}
        <div>
          <label htmlFor="analysisUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Analysis Pinata URL
          </label>
          <input
            id="analysisUrl"
            type="text"
            value={analysisUrl}
            onChange={(e) => setAnalysisUrl(e.target.value)}
            placeholder="https://gateway.pinata.cloud/ipfs/Qm..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste the Pinata IPFS URL for the analysis JSON
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 whitespace-pre-line">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isConnected || isMember === false || checkingMembership}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Proposal...
            </span>
          ) : !isConnected ? (
            'Connect Wallet First'
          ) : checkingMembership ? (
            'Checking Membership...'
          ) : isMember === false ? (
            'Join DAO First'
          ) : (
            'Create Proposal'
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
          <li>Connect your wallet (MetaMask will be used to sign the transaction)</li>
          <li>Paste the Pinata URLs for your image and analysis JSON</li>
          <li>The system downloads and validates the analysis data</li>
          <li>MetaMask will prompt you to confirm the transaction</li>
          <li>After confirmation, your proposal will be created on-chain</li>
          <li>You'll receive the Proposal ID and transaction hash</li>
        </ol>
      </div>
    </div>
  );
}
