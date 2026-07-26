import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import type { StockInfo, StockInfoResponse } from '../types/stockInfo';

interface ResearchViewProps {
  tickers: string[];
}

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'USD': return '$';
    case 'INR': return '₹';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'CAD': return 'C$';
    case 'AUD': return 'A$';
    default: return currency ? `${currency} ` : '$';
  }
}

function formatMarketCap(value: number | null, currency: string): string {
  if (value === null || value === undefined) return 'N/A';
  const symbol = getCurrencySymbol(currency);
  const absVal = Math.abs(value);
  if (absVal >= 1.0e12) {
    return `${symbol}${(value / 1.0e12).toFixed(2)}T`;
  }
  if (absVal >= 1.0e9) {
    return `${symbol}${(value / 1.0e9).toFixed(2)}B`;
  }
  if (absVal >= 1.0e6) {
    return `${symbol}${(value / 1.0e6).toFixed(2)}M`;
  }
  return `${symbol}${value.toLocaleString()}`;
}

function formatPrice(value: number | null, currency: string): string {
  if (value === null || value === undefined) return 'N/A';
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${value.toFixed(2)}`;
}

export default function ResearchView({ tickers }: ResearchViewProps) {
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tickers.length === 0) {
      setStocks([]);
      return;
    }

    const fetchStockInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<StockInfoResponse>('/stocks/info', {
          tickers,
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
  }, [tickers]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center space-x-2">
            <span>Asset Research</span>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full font-normal">
              {tickers.length} Assets Tracked
            </span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Detailed fundamentals, risk profiles, and historical performance for assets in your current pool.
          </p>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tickers.map((t, idx) => (
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
      {!loading && tickers.length === 0 && (
        <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center mb-4 text-zinc-700 border border-zinc-850">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-1">No Assets in Pool</h3>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
            Add stock tickers on the Optimizer page to view their profiles and research metrics here.
          </p>
        </div>
      )}

      {/* Grid of Redesigned Spacious Stock Info Cards */}
      {!loading && stocks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {stocks.map((stock) => {
            const isReturnPositive = stock.one_year_return >= 0;
            return (
              <div
                key={stock.symbol}
                className="bg-zinc-900/40 backdrop-blur-md border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-red-500/40 hover:bg-zinc-900/60 transition-all duration-300 shadow-md shadow-black/20"
              >
                {/* Header: Symbol, Name & Sector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h2 className="text-xl font-bold font-mono text-zinc-100 tracking-wide">
                        {stock.symbol}
                      </h2>
                      <p className="text-xs text-zinc-400 font-medium truncate max-w-[200px]" title={stock.name}>
                        {stock.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-md">
                      {stock.sector}
                    </span>
                  </div>
                </div>

                {/* Price and 1Y Return Display */}
                <div className="bg-zinc-950/70 border border-zinc-850 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Current Price</span>
                    <span className="font-mono text-lg font-bold text-zinc-100">
                      {formatPrice(stock.current_price, stock.currency)}
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
                      {formatMarketCap(stock.market_cap, stock.currency)}
                    </span>
                  </div>
                  <div className="bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850/50">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">1Y Volatility</span>
                    <span className="font-mono font-semibold text-zinc-200">
                      {(stock.volatility * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
