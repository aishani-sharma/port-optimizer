export interface PortfolioRequest {
  tickers: string[];
  period?: string;
  interval?: string;
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
