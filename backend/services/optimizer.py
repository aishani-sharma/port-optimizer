import numpy as np
from scipy.optimize import minimize
from services.metrics import (
    calculate_portfolio_return,
    calculate_portfolio_volatility,
    calculate_sharpe_ratio,
)

def negative_sharpe_ratio(weights: np.ndarray, annual_returns, cov_matrix, risk_free_rate: float = 0.02) -> float:
    """
    SciPy's minimize() only minimizes — it can't maximize directly.
    So to MAXIMIZE Sharpe Ratio, we minimize its negative.
    """
    port_return = calculate_portfolio_return(weights, annual_returns)
    port_volatility = calculate_portfolio_volatility(weights, cov_matrix)
    sharpe = calculate_sharpe_ratio(port_return, port_volatility, risk_free_rate)
    return -sharpe


def optimize_max_sharpe(annual_returns, cov_matrix, risk_free_rate: float = 0.02):
    """
    Find the portfolio weights that maximize the Sharpe Ratio.
    """
    num_assets = len(annual_returns)

    # Constraint: weights must sum to 1 (fully invested, no leverage)
    constraints = ({
        "type": "eq",
        "fun": lambda weights: np.sum(weights) - 1
    })

    # Bounds: each weight between 0 and 1 (no short-selling)
    bounds = tuple((0, 1) for _ in range(num_assets))

    # Initial guess: equal weights, just a starting point for the optimizer
    initial_guess = np.array([1 / num_assets] * num_assets)

    result = minimize(
        negative_sharpe_ratio,
        initial_guess,
        args=(annual_returns, cov_matrix, risk_free_rate),
        method="SLSQP",       # supports equality constraints + bounds
        bounds=bounds,
        constraints=constraints
    )

    optimal_weights = result.x
    return optimal_weights


if __name__ == "__main__":
    from data_fetcher import fetch_price_data
    from metrics import calculate_daily_returns, calculate_annual_returns, calculate_covariance_matrix

    tickers = ["AAPL", "MSFT", "GOOGL"]
    prices = fetch_price_data(tickers, period="1y", interval="1d")

    daily_returns = calculate_daily_returns(prices)
    annual_returns = calculate_annual_returns(daily_returns)
    cov_matrix = calculate_covariance_matrix(daily_returns)

    optimal_weights = optimize_max_sharpe(annual_returns, cov_matrix)

    print("Optimal weights (max Sharpe portfolio):")
    for ticker, weight in zip(tickers, optimal_weights):
        print(f"  {ticker}: {weight * 100:.1f}%")

    # Show performance of this optimal portfolio
    port_return = calculate_portfolio_return(optimal_weights, annual_returns)
    port_volatility = calculate_portfolio_volatility(optimal_weights, cov_matrix)
    sharpe = calculate_sharpe_ratio(port_return, port_volatility)

    print(f"\nExpected return: {port_return*100:.2f}%")
    print(f"Volatility: {port_volatility*100:.2f}%")
    print(f"Sharpe ratio: {sharpe:.4f}")