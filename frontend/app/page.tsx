'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import JoinDAO from '../components/JoinDAO';
import ProposalList from '../components/ProposalList';
import PredictionMarketsList from '../components/PredictionMarketsList';
import CreateProposalForm from '../components/CreateProposalForm';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'home' | 'voting' | 'proposals' | 'markets'>('voting');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Dark Sidebar */}
      <aside className="w-64 bg-[#1a2332] text-white flex flex-col sidebar-scroll overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex flex-col gap-1">
              <div className="h-1 w-12 bg-blue-500 rounded"></div>
              <div className="h-1 w-12 bg-blue-400 rounded"></div>
              <div className="h-1 w-12 bg-blue-300 rounded"></div>
            </div>
            <span className="text-xl font-bold">PAZE</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-300 hover:bg-[#243447]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('voting')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === 'voting'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-300 hover:bg-[#243447]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">Voting (DAO)</span>
            </button>

            <button
              onClick={() => setActiveTab('proposals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === 'proposals'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-300 hover:bg-[#243447]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Create Proposals</span>
            </button>

            <button
              onClick={() => setActiveTab('markets')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === 'markets'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-300 hover:bg-[#243447]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span className="font-medium">Prediction Markets</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-blue-300 hover:bg-[#243447]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">File Lookup</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto p-6 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <div className="mb-2">Network: ADI Testnet</div>
            {address && (
              <div className="font-mono text-blue-300">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content - Light Theme */}
      <main className="flex-1 overflow-y-auto bg-white">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'home' ? 'PAZE' : 'PAZE DAO'}
            </h1>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
                Log in or sign up
              </button>
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {!isConnected ? (
            <div className="max-w-5xl mx-auto">
              {/* Hero Section */}
              <div className="text-center py-20 px-8">
                <h2 className="text-6xl font-bold mb-8 text-gray-900 leading-tight">
                  PAZE - Transformative Action<br />Recognition System
                </h2>
                <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                  A decentralized platform powered by EigenLayer that revolutionizes social impact verification through AI-driven analysis and DAO governance. Using smart glasses like Ray-Ban Meta, we bridge real-world initiatives with Web3 decision-making.
                </p>
                <button className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-base">
                  Join as Agent
                </button>
              </div>

              {/* See PAZE in Action */}
              <div className="mt-20 px-8">
                <h3 className="text-4xl font-bold text-center mb-4 text-gray-900">
                  See PAZE in Action
                </h3>
                <p className="text-center text-gray-600 mb-10 text-base">
                  Watch the demo to see how PAZE transforms social impact verification
                </p>
                <div className="bg-gray-200 rounded-2xl h-[400px] flex items-center justify-center">
                  <div className="text-gray-500 text-lg">Demo Video Placeholder</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <div className="max-w-5xl mx-auto">
                  {/* Hero Section */}
                  <div className="text-center py-20 px-8">
                    <h2 className="text-6xl font-bold mb-8 text-gray-900 leading-tight">
                      PAZE - Transformative Action<br />Recognition System
                    </h2>
                    <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                      A decentralized platform powered by EigenLayer that revolutionizes social impact verification through AI-driven analysis and DAO governance. Using smart glasses like Ray-Ban Meta, we bridge real-world initiatives with Web3 decision-making.
                    </p>
                    <button className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-base">
                      Join as Agent
                    </button>
                  </div>

                  {/* See PAZE in Action */}
                  <div className="mt-20 px-8">
                    <h3 className="text-4xl font-bold text-center mb-4 text-gray-900">
                      See PAZE in Action
                    </h3>
                    <p className="text-center text-gray-600 mb-10 text-base">
                      Watch the demo to see how PAZE transforms social impact verification
                    </p>
                    <div className="bg-gray-200 rounded-2xl h-[400px] flex items-center justify-center">
                      <div className="text-gray-500 text-lg">Demo Video Placeholder</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'voting' && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">PAZE DAO</h2>
                    <p className="text-gray-600 mb-6">
                      Vote on community proposals to release funds for verified social impact initiatives.
                    </p>
                    <p className="text-xs text-gray-500 font-mono mb-6">
                      Contract: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x808d1B4054029e637BD907079313de951B76c2BA'}
                    </p>
                    <JoinDAO />
                  </div>

                  <ProposalList />
                </div>
              )}

              {activeTab === 'proposals' && (
                <div className="max-w-4xl mx-auto">
                  <CreateProposalForm onSuccess={() => {
                    // Optionally switch to voting tab after success
                    setTimeout(() => setActiveTab('voting'), 3000);
                  }} />
                </div>
              )}

              {activeTab === 'markets' && (
                <div className="max-w-6xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Prediction Markets</h2>
                    <p className="text-gray-600">
                      Trade on the outcomes of social impact proposals. Market prices reflect collective wisdom about project success.
                    </p>
                  </div>

                  <PredictionMarketsList />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
