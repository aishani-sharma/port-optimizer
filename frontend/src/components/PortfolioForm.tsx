import React, { useState } from 'react';
import apiClient from '../api/client';
import type { PortfolioResponse } from '../types/portfolio';
import EfficientFrontierChart from './EfficientFrontierChart';
import type { MonteCarloResponse } from '../types/portfolio';


export default function PortfolioForm() {
  // Why use local state for input, loading, and error?
  // 1. input: Tracks the raw string typed by the user in real-time.
  // 2. loading: Tracks whether an asynchronous API call is currently in flight.
  //    This allows us to disable the button to prevent double-submissions, show loading animations, 
  //    and keep the user informed.
  // 3. error: Stores any error messages returned by the API or validation, so we can display it.
  const [tickersInput, setTickersInput] = useState<string>('AAPL, MSFT, GOOGL, AMZN');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PortfolioResponse | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Parse tickers: split by comma, trim whitespace, convert to uppercase, and filter out empty values.
    const tickers = tickersInput
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    if (tickers.length === 0) {
      setError('Please enter at least one valid ticker.');
      setLoading(false);
      return;
    }

    try {
      // POST payload matches the PortfolioRequest interface: { tickers: string[] }
      const response = await apiClient.post<PortfolioResponse>('/portfolio/optimize', {
        tickers,
      });
      setResult(response.data);
      const mcResponse = await apiClient.post<MonteCarloResponse>('/portfolio/simulate', {
        tickers,
        num_portfolios: 3000,
      });
      setMcResult(mcResponse.data);

    } catch (err: any) {
      // Robust error handling to extract details from backend response or fallback to generic message.
      const apiErrorMessage = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
      setError(apiErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format percentages nicely (e.g. 0.1542 -> 15.42%)
  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(2)}%`;
  };

  // Helper function to format decimal values (e.g. 1.8493 -> 1.85)
  const formatDecimal = (val: number) => {
    return val.toFixed(2);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      {/* Optimization Input Card */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:border-zinc-700/60">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="tickers" className="block text-sm font-medium text-zinc-300 mb-2">
              Assets / Tickers
            </label>
            <input
              id="tickers"
              type="text"
              value={tickersInput}
              onChange={(e) => setTickersInput(e.target.value)}
              placeholder="e.g. AAPL, MSFT, GOOGL"
              className="w-full bg-zinc-950/70 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all font-mono text-sm"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-zinc-500">
              Enter assets separated by commas. We will optimize for maximum Sharpe ratio.
            </p>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-xl text-sm flex items-start space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium rounded-xl py-3 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-red-900/20"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Optimizing portfolio...</span>
              </>
            ) : (
              <span>Optimize Portfolio</span>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn transition-all duration-300 hover:border-zinc-700/60">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-semibold text-zinc-100">Optimal Allocations</h3>
            <p className="text-xs text-zinc-400 mt-1">Maximum Sharpe ratio portfolio weights</p>
          </div>

          {/* Allocation Weights list */}
          <div className="space-y-3">
            {Object.entries(result.weights).map(([ticker, weight]) => (
              <div key={ticker} className="flex items-center justify-between py-2 border-b border-zinc-800/40 last:border-0">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-zinc-200">{ticker}</span>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Visual weight bar */}
                  <div className="w-24 bg-zinc-950 h-2 rounded-full overflow-hidden hidden sm:block border border-zinc-800/80">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${weight * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm text-zinc-300 font-semibold w-16 text-right">
                    {formatPercent(weight)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {mcResult && (
            <EfficientFrontierChart
              simulations={mcResult.simulations}
              bestPortfolio={mcResult.best_sharpe_portfolio}
            />
          )}

          {/* Metrics summary grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
            <div className="bg-zinc-950/50 border border-zinc-800/60 p-4 rounded-xl text-center">
              <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                Expected Return
              </span>
              <span className="font-mono text-lg font-bold text-zinc-100">
                {formatPercent(result.expected_return)}
              </span>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800/60 p-4 rounded-xl text-center">
              <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                Volatility
              </span>
              <span className="font-mono text-lg font-bold text-zinc-100">
                {formatPercent(result.volatility)}
              </span>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800/60 p-4 rounded-xl text-center">
              <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                Sharpe Ratio
              </span>
              <span className="font-mono text-lg font-bold text-red-500">
                {formatDecimal(result.sharpe_ratio)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
