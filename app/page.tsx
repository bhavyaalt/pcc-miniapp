'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Users, Coins, Vote, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-black font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-sm">PCC</span>
          </div>
          <a 
            href="/dashboard"
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-md font-medium text-xs text-black transition-all inline-flex items-center gap-1.5"
          >
            Launch App <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-14">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #22c55e 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        
        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          <div className="mb-4">
            <span className="inline-block px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 font-mono">
              onchain collective investing
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            Your Friends.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
              Your Fund.
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-400 mb-8 max-w-xl mx-auto">
            Pool money with people you trust. Invest in what you believe in. 
            No VCs. No gatekeepers. Just you and your crew.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/dashboard"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-semibold text-sm text-black transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#how"
              className="px-6 py-3 bg-[#111116] hover:bg-[#1a1a1f] rounded-lg font-medium text-sm transition-all border border-[#222]"
            >
              How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400">$0</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">TVL</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400">0</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Pools</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400">0</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-5 bg-[#111116]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-8 text-center">
            The Old Way is Broken
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <div className="text-2xl mb-2">🏦</div>
              <h3 className="text-sm font-semibold mb-1 text-red-400">Banks Don&apos;t Get It</h3>
              <p className="text-xs text-gray-500">
                Try telling your bank you want to pool money with friends to angel invest.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="text-sm font-semibold mb-1 text-orange-400">Legal Hell</h3>
              <p className="text-xs text-gray-500">
                LLCs, operating agreements, cap tables... $10k+ before investing $1.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="text-sm font-semibold mb-1 text-yellow-400">Trust Issues</h3>
              <p className="text-xs text-gray-500">
                Venmo your buddy $5k and hope he actually invests it?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              How It Works
            </h2>
            <p className="text-sm text-gray-400">
              Trusted groups. Transparent funds. Onchain accountability.
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              { num: 1, icon: Users, title: 'Create Your Circle', desc: 'Start a pool with friends, family, or your Discord crew. Set the rules: minimum deposit, voting thresholds, who can propose.' },
              { num: 2, icon: Coins, title: 'Pool Your Capital', desc: 'Everyone deposits USDC. You get share tokens representing your stake. Funds held in smart contract — no single person controls them.' },
              { num: 3, icon: Vote, title: 'Propose & Vote', desc: 'Anyone can propose: "Let\'s put $10k into this startup." Members vote with their shares. Majority wins.' },
              { num: 4, icon: TrendingUp, title: 'Invest Together', desc: 'Approved proposals execute automatically. Returns flow back to the pool. Everyone wins (or loses) together.' },
            ].map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">{title}</h3>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-5 bg-[#111116]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">
            What Can You Build?
          </h2>
          <p className="text-sm text-gray-400 text-center mb-10">
            PCC is a primitive. Build whatever you want on top.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-500/10">
              <div className="text-2xl mb-2">👼</div>
              <h3 className="text-sm font-semibold mb-2">Angel Syndicates</h3>
              <p className="text-xs text-gray-400">
                5 friends pool $50k each = $250k angel fund. Invest in startups together, share the upside.
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/10">
              <div className="text-2xl mb-2">🏠</div>
              <h3 className="text-sm font-semibold mb-2">Group Savings</h3>
              <p className="text-xs text-gray-400">
                Family emergency fund. Roommates saving for a trip. Community chest for local projects.
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/10">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="text-sm font-semibold mb-2">Creator Collectives</h3>
              <p className="text-xs text-gray-400">
                10 creators pool funds to invest in each other&apos;s projects. Vote on grants. Share success.
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/10">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="text-sm font-semibold mb-2">DAO Treasury Lite</h3>
              <p className="text-xs text-gray-400">
                Your Discord needs a treasury but full DAO tooling is overkill? PCC = votes + proposals + funds in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Build Your Circle?
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            Start with friends. Scale to a movement.
          </p>
          
          <a 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-semibold text-sm text-black transition-all hover:scale-105"
          >
            Launch App <ArrowRight className="w-4 h-4" />
          </a>
          
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-gray-600">
            <a href="https://warpcast.com" className="hover:text-white transition-colors">Farcaster</a>
            <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://twitter.com" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-5 border-t border-[#222]">
        <div className="max-w-3xl mx-auto text-center text-xs text-gray-600">
          <p>© 2025 Peer Credit Circles. Built for friends, by friends.</p>
        </div>
      </footer>
    </div>
  );
}
