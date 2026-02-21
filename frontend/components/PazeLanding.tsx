'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function PazeLanding({ onConnect }: { onConnect?: () => void }) {
  const [email, setEmail] = useState('');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend/email service
    console.log('Waitlist signup:', email);
    setSubmitted(true);
    setTimeout(() => {
      setShowWaitlist(false);
      setSubmitted(false);
      setEmail('');
    }, 2000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Fixed Header with Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1c]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="h-1 w-8 bg-blue-500 rounded"></div>
              <div className="h-1 w-8 bg-blue-400 rounded"></div>
              <div className="h-1 w-8 bg-blue-300 rounded"></div>
            </div>
            <span className="text-xl font-bold">PAZE</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('hero')} className="text-gray-300 hover:text-white transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-colors">
              Features
            </button>
            {onConnect && (
              <button
                onClick={onConnect}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            {onConnect && (
              <button
                onClick={onConnect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Connect
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1a2332] border-t border-gray-800">
            <nav className="flex flex-col p-4 space-y-2">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-[#243447] rounded-lg transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-[#243447] rounded-lg transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-[#243447] rounded-lg transition-colors"
              >
                Features
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden pt-24">{/* Added pt-24 for header space */}
        {/* Background gradient effect */}
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
              {/* Telegram Header */}
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
              
              {/* Chat Messages */}
              <div className="p-6 space-y-4 min-h-[400px]">
                {/* User message with image */}
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
                
                {/* Bot analyzing */}
                <div className="flex justify-start">
                  <div className="max-w-xs">
                    <div className="bg-[#243447] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-blue-400">Analyzing...</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        📍 Location detected: Main St & 5th Ave<br/>
                        🔍 Issue type: Road damage - Pothole<br/>
                        📊 Severity: High<br/>
                        ☁️ Weather: Clear, 15°C
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">12:34 PM</div>
                  </div>
                </div>
                
                {/* Bot verified */}
                <div className="flex justify-start">
                  <div className="max-w-xs">
                    <div className="bg-[#243447] rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">✅</span>
                        <span className="text-sm font-semibold text-green-400">Verified & Submitted!</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Your report has been verified and submitted to the DAO.
                      </p>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded transition-colors">
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

      {/* Problem Section */}
      <section className="py-20 px-6 bg-[#0d1421]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            We See Problems Every Day —<br />
            <span className="text-gray-400">But Reporting Feels Impossible</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: '⏰',
                title: 'Hours Lost',
                desc: 'City websites & endless forms waste your time'
              },
              {
                icon: '📱',
                title: 'Clunky Apps',
                desc: 'Download apps you\'ll never use again'
              },
              {
                icon: '😤',
                title: 'Too Busy',
                desc: 'No time for bureaucracy in daily life'
              },
              {
                icon: '❓',
                title: 'No Updates',
                desc: 'Reports disappear into a black hole'
              }
            ].map((item, i) => (
              <div key={i} className="bg-[#1a2332] p-6 rounded-xl border border-gray-800 hover:border-blue-600/50 transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-2xl text-blue-400 font-semibold">
              What if it was as easy as sending a message?
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            As Simple as <span className="text-blue-400">Telegram</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16">
            Five steps from problem to action
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                num: '1',
                title: 'Open Telegram',
                desc: 'Chat with @PazeBot',
                icon: '💬'
              },
              {
                num: '2',
                title: 'Snap & Send',
                desc: 'Photo/video + quick note',
                icon: '📸'
              },
              {
                num: '3',
                title: 'AI Analyzes',
                desc: 'Location, weather, damage type',
                icon: '🤖'
              },
              {
                num: '4',
                title: 'ZeroG Verifies',
                desc: 'Cryptographic proof of authenticity',
                icon: '🔐'
              },
              {
                num: '5',
                title: 'DAO Proposal',
                desc: 'Auto-pushed to ADI Chain',
                icon: '🗳️'
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-[#1a2332] p-6 rounded-xl border border-gray-800 hover:border-blue-600 transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {step.num}
                    </div>
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-blue-600/30"></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-block bg-blue-600/10 border border-blue-600/30 rounded-lg px-6 py-4">
              <p className="text-blue-400">
                <span className="font-semibold">Bonus:</span> Community votes + prediction market launches: 
                <span className="italic"> "When will it be fixed?"</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Tech Section */}
      <section id="features" className="py-20 px-6 bg-[#0d1421]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Decentralized Power for <span className="text-blue-400">Real Impact</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16">
            Built on cutting-edge Web3 infrastructure
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Instant Telegram Reporting',
                desc: 'No apps to download. Just message @PazeBot and you\'re done.',
                tech: 'Telegram Bot API'
              },
              {
                icon: '🧠',
                title: 'AI-Powered Detection',
                desc: 'Claude Vision analyzes damage type, severity, and context automatically.',
                tech: 'Anthropic Claude'
              },
              {
                icon: '🔒',
                title: 'Trustless Verification',
                desc: 'ZeroG Storage & Compute provides cryptographic proofs of authenticity.',
                tech: 'ZeroG Network'
              },
              {
                icon: '⚖️',
                title: 'DAO Governance',
                desc: 'Community votes on proposals with transparent on-chain records.',
                tech: 'ADI Testnet Chain'
              },
              {
                icon: '📊',
                title: 'Prediction Markets',
                desc: 'Bet on repair timelines. Accountability meets incentives.',
                tech: 'Smart Contracts'
              },
              {
                icon: '🌐',
                title: 'Decentralized Storage',
                desc: 'Evidence stored on IPFS via Pinata. Immutable and accessible.',
                tech: 'IPFS / Pinata'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-[#1a2332] p-8 rounded-xl border border-gray-800 hover:border-blue-600 transition-all group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.desc}</p>
                <div className="inline-block bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full">
                  {feature.tech}
                </div>
              </div>
            ))}
          </div>
          
          {/* Tech Logos */}
          <div className="mt-16 pt-16 border-t border-gray-800">
            <p className="text-center text-gray-500 mb-8 uppercase text-sm tracking-wider">
              Powered By
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Telegram</div>
              <div className="text-2xl font-bold text-gray-400">ZeroG</div>
              <div className="text-2xl font-bold text-gray-400">ADI Chain</div>
              <div className="text-2xl font-bold text-gray-400">Anthropic</div>
              <div className="text-2xl font-bold text-gray-400">IPFS</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Fix Your City?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of citizens making real change, one report at a time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/Paze2026Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/50 text-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              Start Reporting Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex flex-col gap-1">
                  <div className="h-1 w-8 bg-blue-500 rounded"></div>
                  <div className="h-1 w-8 bg-blue-400 rounded"></div>
                  <div className="h-1 w-8 bg-blue-300 rounded"></div>
                </div>
                <span className="text-xl font-bold">PAZE</span>
              </div>
              <p className="text-gray-400 text-sm">
                People's Waze for Civic Action
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="https://t.me/Paze2026Bot" className="hover:text-blue-400 transition-colors">Telegram Bot</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Twitter</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Paze. Built on ADI Testnet Chain.
            </p>
            <div className="flex gap-6 text-gray-500 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      {showWaitlist && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-6">
          <div className="bg-[#1a2332] rounded-2xl p-8 max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Join the Waitlist</h3>
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
