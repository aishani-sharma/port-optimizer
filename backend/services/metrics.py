import numpy as np
import pandas as pd

TRADING_DAYS = 252


def calculate_daily_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """
    Convert a DataFrame of prices into daily percentage returns.
    Formula: (price_today - price_yesterday) / price_yesterday
    """
    daily_returns = prices.pct_change().dropna()
    return daily_returns


def calculate_annual_returns(daily_returns: pd.DataFrame) -> pd.Series:
    """
    Annualize the mean daily return for each ticker.
    Return scales linearly with time, so we just multiply by trading days.
    """
    return daily_returns.mean() * TRADING_DAYS


def calculate_covariance_matrix(daily_returns: pd.DataFrame) -> pd.DataFrame:
    """
    Annualized covariance matrix between all tickers.
    Covariance scales linearly with time (like variance), so multiply by trading days.
    """
    return daily_returns.cov() * TRADING_DAYS


def calculate_portfolio_return(weights: np.ndarray, annual_returns: pd.Series) -> float:
    """
    Expected portfolio return = weighted sum of individual annual returns.
    E(Rp) = sum(wi * E(Ri))
    """
    return np.dot(weights, annual_returns)


def calculate_portfolio_volatility(weights: np.ndarray, cov_matrix: pd.DataFrame) -> float:
    """
    Portfolio risk (standard deviation), using the covariance matrix.
    sigma_p = sqrt(w^T * Cov * w)
    """
    variance = np.dot(weights.T, np.dot(cov_matrix, weights))
    return np.sqrt(variance)


def calculate_sharpe_ratio(portfolio_return: float, portfolio_volatility: float, risk_free_rate: float = 0.02) -> float:
    """
    Sharpe Ratio = (portfolio return - risk free rate) / portfolio volatility
    """
    return (portfolio_return - risk_free_rate) / portfolio_volatility


if __name__ == "__main__":
    from data_fetcher import fetch_price_data

    tickers = ["AAPL", "MSFT", "GOOGL"]
    prices = fetch_price_data(tickers, period="1y", interval="1d")

    daily_returns = calculate_daily_returns(prices)
    annual_returns = calculate_annual_returns(daily_returns)
    cov_matrix = calculate_covariance_matrix(daily_returns)

    weights = np.array([1/3, 1/3, 1/3])  # equal weight, just to test

    portfolio_return = calculate_portfolio_return(weights, annual_returns)
    portfolio_volatility = calculate_portfolio_volatility(weights, cov_matrix)
    sharpe = calculate_sharpe_ratio(portfolio_return, portfolio_volatility)

    print("Annual returns:\n", annual_returns)
    print("\nCovariance matrix:\n", cov_matrix)
    print(f"\nPortfolio return: {portfolio_return:.4f}")
    print(f"Portfolio volatility: {portfolio_volatility:.4f}")
    print(f"Sharpe ratio: {sharpe:.4f}")