export interface PortfolioRequest {
  tickers: string[];
  period?: string;
  interval?: string;
  max_weight?: number;
  max_volatility?: number | null;
}

export interface PortfolioResponse {
  weights: Record<string, number>;
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
}

export interface SimulatedPoint {
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
}

export interface SimulatedPortfolio {
  weights: Record<string, number>;
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
}

export interface MonteCarloRequest {
  tickers: string[];
  period?: string;
  interval?: string;
  num_portfolios?: number;
}

export interface MonteCarloResponse {
  simulations: SimulatedPoint[];
  best_sharpe_portfolio: SimulatedPortfolio;
}

export interface StockPricesResponse {
  tickers: string[];
  period: string;
  interval: string;
  data: Record<string, Record<string, number>>;
}

export interface BacktestRequest {
  tickers: string[];
  weights: Record<string, number>;
  period?: string;
  interval?: string;
  initial_investment?: number;
  rebalance_frequency_days?: number;
}

export interface BacktestPoint {
  date: string;
  portfolio_value: number;
  benchmark_value: number;
}

export interface BacktestResponse {
  benchmark_ticker: string;
  points: BacktestPoint[];
  portfolio_final_value: number;
  benchmark_final_value: number;
  portfolio_return_pct: number;
  benchmark_return_pct: number;
}
