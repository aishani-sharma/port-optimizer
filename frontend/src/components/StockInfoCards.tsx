import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import type { StockInfo, StockInfoResponse } from '../types/stockInfo';
import { formatCurrency, formatMarketCap } from '../utils/currency';

interface StockInfoCardsProps {
  tickers: string[];
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
      <div className="space-y-2">
        <div className="border-b border-zinc-800 pb-2 mb-2">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Asset Profiles</h4>
        </div>
        {tickers.map((ticker, idx) => (
          <div key={`${ticker}-${idx}`} className="bg-zinc-900/20 border border-zinc-850 p-3 rounded-xl animate-pulse space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/5"></div>
            </div>
            <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-3 rounded-xl text-xs flex items-start space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
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
    <div className="space-y-2">
      <div className="border-b border-zinc-850 pb-2 mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Asset Profiles</h3>
          <p className="text-[10px] text-zinc-500">1Y return & metrics</p>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-850">
          {stocks.length} assets
        </span>
      </div>

      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {stocks.map((stock) => {
          const isReturnPositive = stock.one_year_return >= 0;
          return (
            <div
              key={stock.symbol}
              className="bg-zinc-900/20 backdrop-blur-md border border-zinc-850 p-3 rounded-xl flex flex-col justify-between transition-all duration-300 hover:border-amber-500/30 hover:bg-zinc-900/40"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-sm text-zinc-100">{stock.symbol}</span>
                      <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[90px]">{stock.name}</span>
                    </div>
                    <span className="inline-block mt-0.5 text-[9px] font-semibold tracking-wide uppercase px-1 py-0.2 bg-zinc-950 text-zinc-400 border border-zinc-850 rounded">
                      {stock.sector}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-sm font-bold text-zinc-200 block">
                      {formatCurrency(stock.current_price, stock.currency || stock.symbol)}
                    </span>
                    <span className={`font-mono font-bold text-[10px] ${isReturnPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isReturnPositive ? '+' : ''}{(stock.one_year_return * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-zinc-900/60 text-[10px]">
                <div>
                  <span className="text-zinc-550 block text-[9px] uppercase tracking-wider font-semibold">Market Cap</span>
                  <span className="font-semibold text-zinc-350 font-mono">
                    {formatMarketCap(stock.market_cap, stock.currency || stock.symbol)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-550 block text-[9px] uppercase tracking-wider font-semibold">1Y Volatility</span>
                  <span className="font-semibold text-zinc-350 font-mono">
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
