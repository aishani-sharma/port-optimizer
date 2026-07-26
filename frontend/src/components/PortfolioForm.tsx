import React, { useState } from 'react';
import apiClient from '../api/client';
import type { PortfolioResponse } from '../types/portfolio';
import EfficientFrontierChart from './EfficientFrontierChart';
import type { MonteCarloResponse } from '../types/portfolio';
import type { RiskConstraints } from '../types/riskProfile';
import StockInfoCards from './StockInfoCards';

interface PortfolioFormProps {
  riskConstraints: RiskConstraints;
  tickers: string[];
  setTickers: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PortfolioForm({ riskConstraints, tickers, setTickers }: PortfolioFormProps) {
  const [newTicker, setNewTicker] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PortfolioResponse | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResponse | null>(null);

  const handleAddTicker = (input: string) => {
    const cleanInput = input.trim();
    if (!cleanInput) return;
    
    // Split by commas or spaces
    const parts = cleanInput
      .split(/[\s,]+/)
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    const updatedTickers = [...tickers];
    parts.forEach((part) => {
      if (!updatedTickers.includes(part)) {
        updatedTickers.push(part);
      }
    });

    setTickers(updatedTickers);
    setNewTicker('');
  };

  const handleRemoveTicker = (tickerToRemove: string) => {
    setTickers(tickers.filter((t) => t !== tickerToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tickers.length === 0) {
      setError('Please add at least one stock symbol.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<PortfolioResponse>('/portfolio/optimize', {
        tickers,
        max_weight: riskConstraints.maxWeight,
        max_volatility: riskConstraints.maxVolatility,
      });
      setResult(response.data);
      
      const mcResponse = await apiClient.post<MonteCarloResponse>('/portfolio/simulate', {
        tickers,
        num_portfolios: 3000,
      });
      setMcResult(mcResponse.data);
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
      setError(apiErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(2)}%`;
  };

  const formatDecimal = (val: number) => {
    return val.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full max-w-[1600px] mx-auto px-6 py-6 items-start">
      {/* Left Sidebar Panel: Ticker Input and Asset Profiles */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Assets Configuration</h3>
            <p className="text-[10px] text-zinc-500 mb-3">Add or remove symbols to define the asset pool</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tag-based ticker list with input inside */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Tickers</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950/70 border border-zinc-850 rounded-xl min-h-[44px] focus-within:border-red-500/50 transition-all">
                {tickers.map((ticker) => (
                  <span
                    key={ticker}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono font-bold text-zinc-200"
                  >
                    <span>{ticker}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTicker(ticker)}
                      className="text-zinc-500 hover:text-red-400 cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTicker}
                  onChange={(e) => {
                    if (e.target.value.endsWith(',') || e.target.value.endsWith(' ')) {
                      handleAddTicker(e.target.value);
                    } else {
                      setNewTicker(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTicker(newTicker);
                    }
                  }}
                  onBlur={() => handleAddTicker(newTicker)}
                  placeholder={tickers.length === 0 ? "e.g. TSLA, NVDA" : "Add..."}
                  className="flex-grow bg-transparent border-0 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-0 font-mono text-[11px] p-0.5"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Inline Error Alert banner */}
            {error && (
              <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-3 rounded-xl text-xs flex items-start space-x-2 animate-fadeIn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || tickers.length === 0}
              className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-zinc-900 disabled:text-zinc-650 text-white font-semibold rounded-xl py-2.5 text-xs transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-red-700/30"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Optimizing...</span>
                </>
              ) : (
                <span>Optimize Portfolio</span>
              )}
            </button>
          </form>
        </div>

        {/* Compact stock info vertical list */}
        <StockInfoCards tickers={tickers} />
      </div>

      {/* Center Panel: Efficient Frontier scatter chart */}
      <div className="lg:col-span-2">
        {result && mcResult ? (
          <EfficientFrontierChart
            simulations={mcResult.simulations}
            bestPortfolio={mcResult.best_sharpe_portfolio}
          />
        ) : (
          <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-8 text-center min-h-[480px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center mb-4 text-zinc-700 border border-zinc-850">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Efficient Frontier View</h3>
            <p className="text-[11px] text-zinc-550 max-w-xs leading-relaxed">
              Define assets and run optimization to display thousands of simulated portfolios and highlight the optimal allocation.
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar Panel: Stats & Allocation list */}
      <div className="lg:col-span-1 space-y-6">
        {result ? (
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-4 space-y-5 animate-fadeIn">
            {/* Stat Blocks Stacked Vertically */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-850 pb-2">Portfolio Metrics</h3>
              
              <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Sharpe Ratio</span>
                  <span className="text-zinc-500 text-[10px]">Risk-adjusted performance</span>
                </div>
                <span className="font-mono text-lg font-bold text-red-500">
                  {formatDecimal(result.sharpe_ratio)}
                </span>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Expected Return</span>
                  <span className="text-zinc-500 text-[10px]">Annualized projection</span>
                </div>
                <span className="font-mono text-base font-bold text-zinc-200">
                  {formatPercent(result.expected_return)}
                </span>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Volatility</span>
                  <span className="text-zinc-500 text-[10px]">Annualized risk metric</span>
                </div>
                <span className="font-mono text-base font-bold text-zinc-200">
                  {formatPercent(result.volatility)}
                </span>
              </div>
            </div>

            {/* Optimal Weights list with progress bars */}
            <div className="space-y-3">
              <div className="border-b border-zinc-850 pb-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Optimal Weights</h3>
                <p className="text-[10px] text-zinc-500">Maximum Sharpe ratio allocations</p>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(result.weights).map(([ticker, weight]) => (
                  <div key={ticker} className="space-y-1 py-1 border-b border-zinc-950 last:border-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-zinc-200">{ticker}</span>
                      <span className="font-mono text-zinc-400 font-semibold">
                        {formatPercent(weight)}
                      </span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850/60">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all duration-550"
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-6 text-center min-h-[300px] flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center mb-3 text-zinc-700 border border-zinc-850">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Optimal Weights</h3>
            <p className="text-[10px] text-zinc-550 max-w-[180px] leading-relaxed">
              Allocations and metrics will populate here upon running optimizer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
