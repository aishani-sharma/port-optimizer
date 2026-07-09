import numpy as np
import pandas as pd
from services.metrics import calculate_portfolio_return, calculate_portfolio_volatility, calculate_sharpe_ratio


def generate_random_weights(num_assets: int) -> np.ndarray:
    """
    Generate a single random weight vector that sums to 1.
    Using random values normalized by their sum guarantees this.
    """
    weights = np.random.random(num_assets)
    weights /= np.sum(weights)
    return weights


def run_monte_carlo_simulation(
    annual_returns: pd.Series,
    cov_matrix: pd.DataFrame,
    num_portfolios: int = 5000,
    risk_free_rate: float = 0.02
) -> pd.DataFrame:
    """
    Generate num_portfolios random portfolios and compute their
    return, volatility, and Sharpe ratio for each.

    Returns a DataFrame with one row per simulated portfolio.
    """
    num_assets = len(annual_returns)
    tickers = annual_returns.index

    results = {
        "return": np.zeros(num_portfolios),
        "volatility": np.zeros(num_portfolios),
        "sharpe": np.zeros(num_portfolios),
    }
    # Store weights too, so you can look up what allocation produced
    # any given point on the scatter plot later
    weights_record = np.zeros((num_portfolios, num_assets))

    for i in range(num_portfolios):
        weights = generate_random_weights(num_assets)
        weights_record[i] = weights

        port_return = calculate_portfolio_return(weights, annual_returns)
        port_volatility = calculate_portfolio_volatility(weights, cov_matrix)
        sharpe = calculate_sharpe_ratio(port_return, port_volatility, risk_free_rate)

        results["return"][i] = port_return
        results["volatility"][i] = port_volatility
        results["sharpe"][i] = sharpe

    results_df = pd.DataFrame(results)

    # Attach weights as separate columns, one per ticker
    weights_df = pd.DataFrame(weights_record, columns=tickers)
    full_results = pd.concat([results_df, weights_df], axis=1)

    return full_results


if __name__ == "__main__":
    from data_fetcher import fetch_price_data
    from metrics import calculate_daily_returns, calculate_annual_returns, calculate_covariance_matrix

    tickers = ["AAPL", "MSFT", "GOOGL"]
    prices = fetch_price_data(tickers, period="1y", interval="1d")

    daily_returns = calculate_daily_returns(prices)
    annual_returns = calculate_annual_returns(daily_returns)
    cov_matrix = calculate_covariance_matrix(daily_returns)

    simulated_portfolios = run_monte_carlo_simulation(annual_returns, cov_matrix, num_portfolios=5000)

    print(simulated_portfolios.head())
    print("\nShape:", simulated_portfolios.shape)

    # Find the portfolio with the highest Sharpe ratio from the simulation
    best_sharpe_idx = simulated_portfolios["sharpe"].idxmax()
    best_portfolio = simulated_portfolios.loc[best_sharpe_idx]

    print("\nBest simulated portfolio (highest Sharpe):")
    print(best_portfolio)