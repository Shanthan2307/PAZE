'use client';

import { useState, useEffect } from 'react';

interface ZGTransaction {
  id: string;
  type: 'compute' | 'storage';
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  details: {
    taskId?: string;
    model?: string;
    executionTime?: number;
    nodeId?: string;
    fileHash?: string;
    fileSize?: number;
    storageProof?: string;
  };
  proposalId?: string;
}

export default function ZeroGravityTab() {
  const [transactions, setTransactions] = useState<ZGTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'compute' | 'storage'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      // In a real implementation, this would fetch from your backend/blockchain
      // For now, we'll use mock data to demonstrate the UI
      const mockTransactions: ZGTransaction[] = [
        {
          id: 'tx-1',
          type: 'compute',
          timestamp: new Date().toISOString(),
          status: 'completed',
          details: {
            taskId: 'tagline-1234567890-abc123',
            model: 'llama-3-8b-instruct',
            executionTime: 2340,
            nodeId: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
          },
          proposalId: '0x123...'
        },
        {
          id: 'tx-2',
          type: 'storage',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          details: {
            fileHash: 'QmX4Rh3EYqFjP9H8w2N5K6vL7mT9pQ1sR2uV3wX4yZ5aB6',
            fileSize: 245678,
            storageProof: '0x9f2c8e1d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d'
          },
          proposalId: '0x123...'
        }
      ];

      setTransactions(mockTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-2">
          ⚡ 0G Network Integration
        </h2>
        <p className="text-gray-300">
          Decentralized compute and storage powered by 0G Network
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-white">{transactions.length}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Compute Tasks</div>
          <div className="text-2xl font-bold text-purple-400">
            {transactions.filter(tx => tx.type === 'compute').length}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Storage Operations</div>
          <div className="text-2xl font-bold text-blue-400">
            {transactions.filter(tx => tx.type === 'storage').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('compute')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'compute'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🧠 Compute
        </button>
        <button
          onClick={() => setFilter('storage')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'storage'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          ☁️ Storage
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {tx.type === 'compute' ? '🧠' : '☁️'}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {tx.type === 'compute' ? '0G Compute Task' : '0G Storage Operation'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(tx.status)}`}>
                  <span>{getStatusIcon(tx.status)}</span>
                  <span className="capitalize">{tx.status}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {tx.type === 'compute' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Task ID:</span>
                      <span className="text-gray-300 font-mono">
                        {tx.details.taskId?.substring(0, 30)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="text-purple-400">{tx.details.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Execution Time:</span>
                      <span className="text-gray-300">{tx.details.executionTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Node ID:</span>
                      <span className="text-gray-300 font-mono text-xs">
                        {tx.details.nodeId}
                      </span>
                    </div>
                  </>
                )}

                {tx.type === 'storage' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">File Hash:</span>
                      <span className="text-gray-300 font-mono text-xs">
                        {tx.details.fileHash}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">File Size:</span>
                      <span className="text-gray-300">
                        {((tx.details.fileSize || 0) / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Storage Proof:</span>
                      <span className="text-gray-300 font-mono text-xs">
                        {tx.details.storageProof?.substring(0, 20)}...
                      </span>
                    </div>
                  </>
                )}

                {tx.proposalId && (
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Linked Proposal:</span>
                    <span className="text-blue-400 font-mono text-xs">
                      {tx.proposalId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">About 0G Network Integration</h3>
        <p className="text-gray-300 text-sm mb-3">
          PAZE leverages 0G Network's decentralized infrastructure for:
        </p>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">🧠</span>
            <span>
              <strong>0G Compute:</strong> AI-powered analysis using free models like Llama-3-8B
              to generate taglines and insights for infrastructure issues
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">☁️</span>
            <span>
              <strong>0G Storage:</strong> Decentralized storage for proposal data, images,
              and analysis results with cryptographic verification
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
