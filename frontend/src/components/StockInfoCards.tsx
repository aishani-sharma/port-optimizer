import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import type { StockInfo, StockInfoResponse } from '../types/stockInfo';

interface StockInfoCardsProps {
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

export default function StockInfoCards({ tickers }: StockInfoCardsProps) {
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

  if (loading) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Asset Profiles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickers.map((ticker, idx) => (
            <div key={`${ticker}-${idx}`} className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl animate-pulse space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-zinc-800 rounded w-1/4"></div>
                  <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                </div>
                <div className="h-5 bg-zinc-800 rounded w-1/5"></div>
              </div>
              <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/30">
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl text-sm flex items-start space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span>Failed to fetch stock info: {error}</span>
      </div>
    );
  }

  if (stocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-zinc-800 pb-2">
        <h3 className="text-lg font-semibold text-zinc-100">Asset Profiles</h3>
        <p className="text-xs text-zinc-400 mt-1">Real-time details and 1-year performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocks.map((stock) => {
          const isReturnPositive = stock.one_year_return >= 0;
          return (
            <div
              key={stock.symbol}
              className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-950/10"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono font-bold text-lg text-zinc-100 block">{stock.symbol}</span>
                    <span className="text-xs text-zinc-400 font-medium line-clamp-1">{stock.name}</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                    {stock.sector}
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-baseline">
                  <span className="text-2xl font-bold font-mono text-zinc-200">
                    {formatPrice(stock.current_price, stock.currency)}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-zinc-500 font-semibold block">1Y Return</span>
                    <span className={`font-mono font-semibold text-sm ${isReturnPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isReturnPositive ? '+' : ''}{(stock.one_year_return * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-zinc-800/40 text-xs">
                <div>
                  <span className="text-zinc-500 block">Market Cap</span>
                  <span className="font-semibold text-zinc-300 font-mono">
                    {formatMarketCap(stock.market_cap, stock.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">1Y Volatility</span>
                  <span className="font-semibold text-zinc-300 font-mono">
                    {(stock.volatility * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
