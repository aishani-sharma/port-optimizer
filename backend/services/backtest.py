import pandas as pd
import numpy as np


def get_benchmark_ticker(tickers: list[str]) -> str:
    """
    Auto-detect which benchmark index to use based on the tickers provided.
    Indian tickers on yfinance end in '.NS'. US tickers have no suffix.
    """
    if any(t.upper().endswith(".NS") for t in tickers):
        return "^NSEI"  # Nifty 50
    return "^GSPC"  # S&P 500


def run_backtest(
    prices: pd.DataFrame,
    weights: dict[str, float],
    initial_investment: float = 10000,
    rebalance_frequency_days: int = 30,
) -> pd.DataFrame:
    """
    Simulate portfolio value over time with periodic rebalancing.

    Args:
        prices: DataFrame of historical prices, dates as index, tickers as columns
        weights: target allocation weights, e.g. {"AAPL": 0.4, "GOOGL": 0.4, "AMZN": 0.2}
        initial_investment: starting portfolio value in the base currency
        rebalance_frequency_days: how often (in trading days) to reset back to target weights

    Returns:
        DataFrame with columns: date, portfolio_value
    """
    tickers = list(weights.keys())
    dates = prices.index

    # Day 0: convert dollar allocation into share counts for each ticker
    shares = {}
    for ticker in tickers:
        allocation = initial_investment * weights[ticker]
        price_on_day0 = prices.iloc[0][ticker]
        shares[ticker] = allocation / price_on_day0 if price_on_day0 > 0 else 0

    portfolio_values = []

    for day_index, date in enumerate(dates):
        # Calculate today's total portfolio value using current share counts
        current_value = sum(
            shares[ticker] * prices.loc[date][ticker] for ticker in tickers
        )
        portfolio_values.append(current_value)

        # Rebalance every N days (but not on day 0, since we just set initial shares)
        if day_index > 0 and day_index % rebalance_frequency_days == 0:
            for ticker in tickers:
                target_allocation = current_value * weights[ticker]
                price_today = prices.loc[date][ticker]
                shares[ticker] = target_allocation / price_today if price_today > 0 else 0

    result = pd.DataFrame({
        "date": dates,
        "portfolio_value": portfolio_values,
    })

    return result


def run_benchmark_backtest(
    benchmark_prices: pd.Series,
    initial_investment: float = 10000,
) -> pd.DataFrame:
    """
    Simple buy-and-hold backtest for a single benchmark index (no rebalancing needed
    since it's a single asset).
    """
    dates = benchmark_prices.index
    initial_price = benchmark_prices.iloc[0]
    shares = initial_investment / initial_price if initial_price > 0 else 0

    portfolio_values = [shares * price for price in benchmark_prices]

    result = pd.DataFrame({
        "date": dates,
        "portfolio_value": portfolio_values,
    })

    return result


if __name__ == "__main__":
    from data_fetcher import fetch_price_data

    tickers = ["AAPL", "MSFT", "GOOGL", "AMZN"]
    weights = {"AAPL": 0.4, "MSFT": 0.0, "GOOGL": 0.4, "AMZN": 0.2}

    prices = fetch_price_data(tickers, period="1y", interval="1d")
    result = run_backtest(prices, weights, initial_investment=10000, rebalance_frequency_days=30)

    print(result.head())
    print(result.tail())
    print(f"\nPortfolio final value: ${result['portfolio_value'].iloc[-1]:,.2f}")

    # Benchmark comparison
    benchmark_ticker = get_benchmark_ticker(tickers)
    benchmark_prices_df = fetch_price_data([benchmark_ticker], period="1y", interval="1d")
    benchmark_result = run_benchmark_backtest(benchmark_prices_df[benchmark_ticker], initial_investment=10000)

    print(f"\nBenchmark ({benchmark_ticker}) final value: ${benchmark_result['portfolio_value'].iloc[-1]:,.2f}")