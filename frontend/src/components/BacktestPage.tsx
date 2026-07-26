import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import apiClient from '../api/client';
import type { BacktestResponse } from '../types/portfolio';
import { formatCurrency } from '../utils/currency';

interface BacktestPageProps {
  tickers: string[];
  weights: Record<string, number> | null;
  onGoToOptimizer: () => void;
}

function formatPercent(val: number): string {
  const pct = (val * 100).toFixed(2);
  return `${val >= 0 ? '+' : ''}${pct}%`;
}

function getBenchmarkLabel(ticker: string): string {
  if (ticker === '^GSPC') return 'S&P 500';
  if (ticker === '^NSEI') return 'Nifty 50';
  return ticker;
}

export default function BacktestPage({
  tickers,
  weights,
  onGoToOptimizer,
}: BacktestPageProps) {
  const [data, setData] = useState<BacktestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!weights || Object.keys(weights).length === 0 || tickers.length === 0) {
      setData(null);
      return;
    }

    const fetchBacktest = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<BacktestResponse>('/portfolio/backtest', {
          tickers,
          weights,
          period: '1y',
          interval: '1d',
          initial_investment: 10000,
          rebalance_frequency_days: 30,
        });
        setData(response.data);
      } catch (err: any) {
        const message = err.response?.data?.detail || err.message || 'Failed to run portfolio backtest.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBacktest();
  }, [tickers, weights]);

  // Empty State: No optimization run yet
  if (!weights || Object.keys(weights).length === 0) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-6 py-12">
        <div className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-12 text-center max-w-md mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-600 border border-zinc-850">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.94" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-200">No Optimization Run Yet</h2>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Please run the Optimizer first to compute optimal asset weights for backtesting.
            </p>
          </div>
          <button
            onClick={onGoToOptimizer}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-amber-950/50"
          >
            Go to Optimizer
          </button>
        </div>
      </div>
    );
  }

  const benchmarkLabel = data ? getBenchmarkLabel(data.benchmark_ticker) : 'Benchmark';

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center space-x-2">
            <span>Portfolio Backtest</span>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full font-normal">
              1-Year Simulation ({formatCurrency(10000, tickers)} Initial)
            </span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Historical portfolio performance with 30-day periodic rebalancing compared against key benchmark index.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-zinc-900/30 border border-zinc-850 p-12 rounded-2xl animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-28 bg-zinc-800/40 rounded-xl"></div>
            <div className="h-28 bg-zinc-800/40 rounded-xl"></div>
          </div>
          <div className="h-[400px] bg-zinc-800/20 rounded-xl"></div>
        </div>
      )}

      {/* Content display */}
      {!loading && data && (
        <div className="space-y-6">
          {/* Headline Stat Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Your Portfolio */}
            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl space-y-2 shadow-md shadow-black/20">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
                  Your Portfolio
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  Optimized Sharpe
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl md:text-3xl font-extrabold font-mono text-zinc-100">
                  {formatCurrency(data.portfolio_final_value, tickers)}
                </span>
                <span className={`font-mono text-base font-bold ${data.portfolio_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercent(data.portfolio_return_pct)}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block pt-1">
                Started with {formatCurrency(10000, tickers)} • Rebalanced every 30 days
              </span>
            </div>

            {/* Card 2: Benchmark */}
            <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl space-y-2 shadow-md shadow-black/20">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
                  {benchmarkLabel} Benchmark
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  {data.benchmark_ticker}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl md:text-3xl font-extrabold font-mono text-zinc-100">
                  {formatCurrency(data.benchmark_final_value, tickers)}
                </span>
                <span className={`font-mono text-base font-bold ${data.benchmark_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercent(data.benchmark_return_pct)}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block pt-1">
                Buy & hold baseline benchmark comparison
              </span>
            </div>
          </div>

          {/* Recharts LineChart Plotting Portfolio vs Benchmark */}
          <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Portfolio Trajectory vs Benchmark
                </h3>
                <p className="text-[11px] text-zinc-500">Daily evaluation over historical price data</p>
              </div>
            </div>

            <div className="h-[400px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.points} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    minTickGap={35}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => formatCurrency(val, tickers)}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#09090b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f4f4f5',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val) || 0, tickers), '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="portfolio_value"
                    name="Your Portfolio"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#f59e0b' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark_value"
                    name={`${benchmarkLabel} (${data.benchmark_ticker})`}
                    stroke="#e4e4e7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 4, fill: '#e4e4e7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
