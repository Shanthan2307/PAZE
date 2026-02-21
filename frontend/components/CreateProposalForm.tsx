'use client';

import { useState } from 'react';

interface CreateProposalFormProps {
  onSuccess?: () => void;
}

export default function CreateProposalForm({ onSuccess }: CreateProposalFormProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [analysisUrl, setAnalysisUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      // Validate URLs
      const imageCID = extractCID(imageUrl);
      const analysisCID = extractCID(analysisUrl);

      if (!imageCID) {
        throw new Error('Invalid image Pinata URL. Please provide a valid IPFS link.');
      }

      if (!analysisCID) {
        throw new Error('Invalid analysis Pinata URL. Please provide a valid IPFS link.');
      }

      // Submit to API
      const response = await fetch('/api/create-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageCID,
          analysisCID,
          imageUrl,
          analysisUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create proposal');
      }

      setSuccess(`✅ Proposal created successfully!\nProposal ID: ${data.proposalId}\nTransaction: ${data.txHash}`);
      setImageUrl('');
      setAnalysisUrl('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
          disabled={loading}
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
          ) : (
            'Create Proposal'
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
          <li>Paste the Pinata URLs for your image and analysis JSON</li>
          <li>The system downloads and validates the analysis data</li>
          <li>Impact agent processes the data and creates a formatted proposal</li>
          <li>Proposal is submitted to the DAO smart contract</li>
          <li>You'll receive the Proposal ID and transaction hash</li>
        </ol>
      </div>
    </div>
  );
}
