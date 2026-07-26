import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import type { StockInfo, StockInfoResponse } from '../types/stockInfo';
import { formatCurrency, formatMarketCap } from '../utils/currency';

interface ResearchViewProps {
  tickers: string[];
  onAddToPortfolio?: (ticker: string) => void;
}

const CURATED_WATCHLIST = [
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'ICICIBANK.NS',
  'ITC.NS',
  'BHARTIARTL.NS',
  'LT.NS',
  'AAPL',
  'MSFT',
];

export default function ResearchView({ tickers, onAddToPortfolio }: ResearchViewProps) {
  const [extraTickers, setExtraTickers] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Deduplicated union of portfolio tickers, curated watchlist, and user-searched tickers
  const combinedTickers = Array.from(
    new Set([...tickers, ...CURATED_WATCHLIST, ...extraTickers])
  );

  useEffect(() => {
    if (combinedTickers.length === 0) {
      setStocks([]);
      return;
    }

    const fetchStockInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<StockInfoResponse>('/stocks/info', {
          tickers: combinedTickers,
        });
        setStocks(response.data.stocks);
      } catch (err: any) {
        const apiErrorMessage = err.response?.data?.detail || err.message || 'Failed to load stock details.';
        setError(apiErrorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStockInfo();
  }, [tickers, extraTickers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    if (!clean) return;

    if (!combinedTickers.includes(clean)) {
      setExtraTickers((prev) => [...prev, clean]);
    }
    setSearchInput('');
  };

  const handleRemoveExtra = (tickerToRemove: string) => {
    setExtraTickers((prev) => prev.filter((t) => t !== tickerToRemove));
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Page Header and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center space-x-2">
            <span>Asset Research & Watchlist</span>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full font-normal">
              {combinedTickers.length} Assets
            </span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Featured Indian large-caps and US market leaders alongside your active portfolio assets. Search any custom ticker to research.
          </p>
        </div>

        {/* Independent Ticker Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full lg:w-auto">
          <div className="relative flex-grow lg:w-72">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search ticker (e.g. WPRO.NS, NVDA)..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!searchInput.trim()}
            className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-850 disabled:text-zinc-600 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
          >
            Search Asset
          </button>
        </form>
      </div>

      {/* Loading Skeletons Grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {combinedTickers.map((t, idx) => (
            <div
              key={`${t}-${idx}`}
              className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl animate-pulse space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-3/4">
                  <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
                </div>
                <div className="h-5 bg-zinc-800 rounded w-1/4"></div>
              </div>
              <div className="h-10 bg-zinc-800/50 rounded-xl"></div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-8 bg-zinc-800/40 rounded"></div>
                <div className="h-8 bg-zinc-800/40 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>Failed to load asset details: {error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && combinedTickers.length === 0 && (
        <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center mb-4 text-zinc-700 border border-zinc-850">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-1">No Assets Tracked</h3>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
            Search a ticker above or configure portfolio assets on the Optimizer page.
          </p>
        </div>
      )}

      {/* Grid of Redesigned Spacious Stock Info Cards */}
      {!loading && stocks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {stocks.map((stock) => {
            const isReturnPositive = stock.one_year_return >= 0;
            const isPortfolioAsset = tickers.includes(stock.symbol);
            const isExtraSearched = extraTickers.includes(stock.symbol);

            return (
              <div
                key={stock.symbol}
                className="bg-zinc-900/40 backdrop-blur-md border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 hover:bg-zinc-900/60 transition-all duration-300 shadow-md shadow-black/20"
              >
                {/* Header: Symbol, Name & Sector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-bold font-mono text-zinc-100 tracking-wide">
                          {stock.symbol}
                        </h2>
                        {isPortfolioAsset ? (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-900/40 rounded">
                            In Portfolio
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-zinc-850 text-zinc-400 border border-zinc-700/60 rounded">
                            Watchlist
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-medium truncate max-w-[180px] mt-0.5" title={stock.name}>
                        {stock.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-md flex-shrink-0">
                      {stock.sector}
                    </span>
                  </div>
                </div>

                {/* Price and 1Y Return Display */}
                <div className="bg-zinc-950/70 border border-zinc-850 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Current Price</span>
                    <span className="font-mono text-lg font-bold text-zinc-100">
                      {formatCurrency(stock.current_price, stock.currency || stock.symbol || combinedTickers)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">1Y Return</span>
                    <div className="flex items-center space-x-1 justify-end">
                      <span className={`font-mono text-sm font-bold ${isReturnPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isReturnPositive ? '+' : ''}{(stock.one_year_return * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid Metrics: Market Cap & Volatility */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-900 text-xs">
                  <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/50">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Market Cap</span>
                    <span className="font-mono font-semibold text-zinc-200">
                      {formatMarketCap(stock.market_cap, stock.currency || stock.symbol || combinedTickers)}
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/50">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">1Y Volatility</span>
                    <span className="font-mono font-semibold text-zinc-200">
                      {(stock.volatility * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                {!isPortfolioAsset && (
                  <div className="pt-2 flex items-center justify-between border-t border-zinc-900/60">
                    {onAddToPortfolio && (
                      <button
                        onClick={() => onAddToPortfolio(stock.symbol)}
                        className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <span>+ Add to Portfolio</span>
                      </button>
                    )}
                    {isExtraSearched && (
                      <button
                        onClick={() => handleRemoveExtra(stock.symbol)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer ml-auto"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
