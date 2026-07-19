import yfinance as yf
import pandas as pd
import numpy as np
from services.data_fetcher import fetch_price_data
from services.metrics import calculate_daily_returns, calculate_annual_returns, TRADING_DAYS

def get_stock_info(tickers: list[str]) -> list[dict]:
    """
    Fetches information and computes 1-year historical return and volatility for each ticker.
    """
    results = []
    # Deduplicate and clean tickers
    unique_tickers = list(dict.fromkeys([t.strip().upper() for t in tickers if t.strip()]))
    
    for ticker_symbol in unique_tickers:
        try:
            ticker_obj = yf.Ticker(ticker_symbol)
            info = ticker_obj.info or {}
            
            # Fetch name with fallbacks
            name = info.get("longName") or info.get("shortName") or ticker_symbol
            # Sector
            sector = info.get("sector") or "N/A"
            # Currency
            currency = info.get("currency") or "USD"
            # Market Cap
            market_cap = info.get("marketCap")
            if market_cap is not None:
                market_cap = float(market_cap)
            
            # Current Price
            current_price = info.get("currentPrice") or info.get("regularMarketPrice")
            if current_price is not None:
                current_price = float(current_price)
                
            one_year_return = 0.0
            volatility = 0.0
            
            # Calculate 1-year return and volatility from daily price data
            try:
                # Fetch price data individually to avoid dropna alignment issues between different assets
                prices = fetch_price_data([ticker_symbol], period="1y", interval="1d")
                if not prices.empty and ticker_symbol in prices.columns:
                    daily_returns = calculate_daily_returns(prices)
                    if not daily_returns.empty:
                        annual_returns = calculate_annual_returns(daily_returns)
                        if ticker_symbol in annual_returns.index:
                            one_year_return = float(annual_returns[ticker_symbol])
                        
                        vol = daily_returns[ticker_symbol].std() * np.sqrt(TRADING_DAYS)
                        if not np.isnan(vol) and not np.isinf(vol):
                            volatility = float(vol)
            except Exception:
                pass
                
            results.append({
                "symbol": ticker_symbol,
                "name": name,
                "sector": sector,
                "currency": currency,
                "market_cap": market_cap,
                "current_price": current_price,
                "one_year_return": one_year_return,
                "volatility": volatility
            })
        except Exception:
            # Absolute fallback for invalid or failed tickers
            results.append({
                "symbol": ticker_symbol,
                "name": ticker_symbol,
                "sector": "N/A",
                "currency": "USD",
                "market_cap": None,
                "current_price": None,
                "one_year_return": 0.0,
                "volatility": 0.0
            })
            
    return results
