export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  currency: string;
  market_cap: number | null;
  current_price: number | null;
  one_year_return: number;
  volatility: number;
}

export interface StockInfoResponse {
  stocks: StockInfo[];
}
