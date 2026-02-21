'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import JoinDAO from './JoinDAO';
import ProposalList from './ProposalList';
import PredictionMarketsList from './PredictionMarketsList';
import CreateProposalForm from './CreateProposalForm';

export default function DAOApp() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'home' | 'voting' | 'proposals' | 'markets'>('home');
  const [email, setEmail] = useState('');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Waitlist signup:', email);
    setSubmitted(true);
    setTimeout(() => {
      setShowWaitlist(false);
      setSubmitted(false);
      setEmail('');
    }, 2000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'home' ? 'PAZE' : 'PAZE DAO'}
            </h1>
            <div className="flex items-center gap-4">
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={activeTab === 'home' ? '' : 'p-8'}>
          {activeTab === 'home' && (
            <div className="min-h-screen bg-[#0a0f1c] text-white">
              {/* Hero Section */}
              <section className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent opacity-50"></div>
                
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                  {/* Left: Text Content */}
                  <div className="space-y-8">
                    <div className="inline-block">
                      <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">
                        People's Waze for Civic Action
                      </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                      Fix Your City<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                        in Seconds
                      </span>
                    </h1>
                    
                    <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                      Report potholes, cracked sidewalks & urban issues instantly via Telegram — 
                      no apps, no forms, no hassle.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <a
                        href="https://t.me/Paze2026Bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/50"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                        </svg>
                        Start Reporting → @PazeBot
                      </a>
                      
                      <button
                        onClick={() => setShowWaitlist(true)}
                        className="px-8 py-4 border-2 border-blue-600 text-blue-400 hover:bg-blue-600/10 font-semibold rounded-lg transition-all"
                      >
                        Join Waitlist
                      </button>
                    </div>
                  </div>
                  
                  {/* Right: Telegram Chat Mockup */}
                  <div className="relative">
                    <div className="bg-[#1a2332] rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
                      <div className="bg-[#2b5278] px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold">Paze Bot</div>
                          <div className="text-xs text-blue-200">online</div>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4 min-h-[400px]">
                        <div className="flex justify-end">
                          <div className="max-w-xs">
                            <div className="bg-[#2b5278] rounded-lg p-3 mb-1">
                              <div className="bg-gray-700 rounded h-32 mb-2 flex items-center justify-center text-gray-400 text-sm">
                                📸 Pothole Image
                              </div>
                              <p className="text-sm">Huge pothole on Main St near 5th Ave</p>
                            </div>
                            <div className="text-xs text-gray-500 text-right">12:34 PM</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="max-w-xs">
                            <div className="bg-[#243447] rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-blue-400">Analyzing...</span>
                              </div>
                              <p className="text-sm text-gray-300">
                                📍 Location detected<br/>
                                🔍 Issue: Road damage<br/>
                                📊 Severity: High
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">12:34 PM</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="max-w-xs">
                            <div className="bg-[#243447] rounded-lg p-4 border-l-4 border-green-500">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">✅</span>
                                <span className="text-sm font-semibold text-green-400">Verified & Submitted!</span>
                              </div>
                              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded transition-colors mt-2">
                                🗳️ Create DAO Proposal
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">12:35 PM</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Stats */}
              <section className="py-12 px-6 bg-[#0d1421] border-y border-gray-800">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">Instant</div>
                    <div className="text-gray-400">Reporting</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">AI-Powered</div>
                    <div className="text-gray-400">Analysis</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">Blockchain</div>
                    <div className="text-gray-400">Verified</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">Community</div>
                    <div className="text-gray-400">Driven</div>
                  </div>
                </div>
              </section>
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
                  Contract: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x033480cD0519B7e5b2AAcd64F7B5C018FbeEC20A'}
                </p>
                <JoinDAO />
              </div>

              <ProposalList />
            </div>
          )}

          {activeTab === 'proposals' && (
            <div className="max-w-4xl mx-auto">
              <CreateProposalForm onSuccess={() => {
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
        </div>
      </main>

      {/* Waitlist Modal */}
      {showWaitlist && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-6">
          <div className="bg-[#1a2332] rounded-2xl p-8 max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Join the Waitlist</h3>
              <button
                onClick={() => setShowWaitlist(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {!submitted ? (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-[#0d1421] border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Join Waitlist
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-xl font-semibold text-green-400">You're on the list!</p>
                <p className="text-gray-400 mt-2">We'll notify you when we launch.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
