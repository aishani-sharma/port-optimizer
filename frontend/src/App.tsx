import { useState } from 'react';
import PortfolioForm from './components/PortfolioForm';
import RiskQuestionnaire from './components/RiskQuestionnaire';
import NavigationRail, { type NavTab } from './components/NavigationRail';
import ResearchView from './components/ResearchView';
import type { RiskConstraints } from './types/riskProfile';

/**
 * Main application component.
 * 
 * Multi-page dashboard with a persistent left navigation rail.
 * Near-black background (zinc-950) with red accents (red-500/red-600)
 * providing a sleek fintech aesthetic.
 */
function App() {
  const [riskConstraints, setRiskConstraints] = useState<RiskConstraints | null>(null);
  const [tickers, setTickers] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL', 'AMZN']);
  const [activeTab, setActiveTab] = useState<NavTab>('optimizer');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Helper function to format percentages nicely
  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(2)}%`;
  };

  const handleRiskComplete = (constraints: RiskConstraints) => {
    setRiskConstraints(constraints);
    setActiveTab('optimizer');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-row relative overflow-hidden">
      {/* Decorative premium radial background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Persistent Left Navigation Rail */}
      <NavigationRail
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto z-10">
        {/* Header Bar */}
        <header className="border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between min-h-[57px]">
            {/* Header Title / Active View Name */}
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-zinc-300 tracking-tight text-sm uppercase">
                {activeTab === 'optimizer' && 'Portfolio Optimizer'}
                {activeTab === 'research' && 'Asset Research & Fundamentals'}
                {activeTab === 'risk' && 'Risk Tolerance Assessment'}
              </span>
            </div>

            {/* Active Constraints Inline in Header */}
            {riskConstraints ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3 text-xs bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-xl">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Constraints</span>
                  <span className="text-zinc-700">|</span>
                  <span className="text-zinc-300 font-medium">
                    Profile: <span className="text-red-500 font-bold">{riskConstraints.category}</span>
                  </span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-zinc-400">
                    Max Weight: {formatPercent(riskConstraints.maxWeight)}
                  </span>
                  {riskConstraints.maxVolatility !== null && (
                    <>
                      <span className="text-zinc-700">•</span>
                      <span className="text-zinc-400">
                        Max Volatility: {formatPercent(riskConstraints.maxVolatility)}
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab('risk')}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 cursor-pointer transition-all duration-200"
                >
                  Redo Questionnaire
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
                  v1.0.0-beta
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-grow flex flex-col w-full">
          {activeTab === 'optimizer' && (
            !riskConstraints ? (
              <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-16">
                <div className="w-full max-w-xl text-center space-y-4 mb-10">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
                    Portfolio Optimizer
                  </h1>
                  <p className="text-zinc-400 max-w-md mx-auto text-sm md:text-base leading-relaxed">
                    Complete the risk assessment below to define your investment constraints and enable Modern Portfolio Theory (MPT) optimization.
                  </p>
                </div>
                <RiskQuestionnaire onComplete={handleRiskComplete} />
              </div>
            ) : (
              <PortfolioForm
                riskConstraints={riskConstraints}
                tickers={tickers}
                setTickers={setTickers}
              />
            )
          )}

          {activeTab === 'research' && (
            <ResearchView tickers={tickers} />
          )}

          {activeTab === 'risk' && (
            <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-16">
              <div className="w-full max-w-xl text-center space-y-3 mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
                  Risk Assessment Questionnaire
                </h1>
                <p className="text-zinc-400 text-xs md:text-sm">
                  Answer the following questions to establish your risk profile and portfolio constraints.
                </p>
              </div>
              <RiskQuestionnaire onComplete={handleRiskComplete} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs text-zinc-600 mt-auto">
          <div className="max-w-[1600px] mx-auto px-6">
            <p>© {new Date().getFullYear()} PortOpt. Built with React, TypeScript & Tailwind CSS.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;