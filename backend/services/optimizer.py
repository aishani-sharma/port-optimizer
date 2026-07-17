import numpy as np
from scipy.optimize import minimize
from services.metrics import calculate_portfolio_return, calculate_portfolio_volatility, calculate_sharpe_ratio


def negative_sharpe_ratio(weights, annual_returns, cov_matrix, risk_free_rate=0.02):
    port_return = calculate_portfolio_return(weights, annual_returns)
    port_volatility = calculate_portfolio_volatility(weights, cov_matrix)
    sharpe = calculate_sharpe_ratio(port_return, port_volatility, risk_free_rate)
    return -sharpe


class OptimizationError(Exception):
    """Raised when the optimizer can't find a valid portfolio under the given constraints."""
    pass


def optimize_max_sharpe(
    annual_returns,
    cov_matrix,
    risk_free_rate: float = 0.02,
    max_weight: float = 1.0,
    max_volatility: float | None = None,
):
    """
    Find portfolio weights that maximize Sharpe Ratio, subject to:
    - weights summing to 1 (fully invested)
    - each weight capped at max_weight (risk profile constraint)
    - optionally, portfolio volatility capped at max_volatility

    Raises OptimizationError if no valid portfolio satisfies the constraints
    (e.g. max_volatility is too tight for the given stocks).
    """
    num_assets = len(annual_returns)

    # Sanity check: if max_weight is too small to even cover 100% allocation,
    # there's no way to satisfy "weights sum to 1" — fail fast with a clear message
    if max_weight * num_assets < 1.0:
        raise OptimizationError(
            f"max_weight of {max_weight:.0%} per stock is too low to fully "
            f"allocate across {num_assets} stocks. Increase max_weight or add more tickers."
        )

    constraints = [
        {"type": "eq", "fun": lambda weights: np.sum(weights) - 1}
    ]

    if max_volatility is not None:
        constraints.append({
            "type": "ineq",
            "fun": lambda weights: max_volatility - calculate_portfolio_volatility(weights, cov_matrix)
        })

    bounds = tuple((0, max_weight) for _ in range(num_assets))
    initial_guess = np.array([1 / num_assets] * num_assets)

    result = minimize(
        negative_sharpe_ratio,
        initial_guess,
        args=(annual_returns, cov_matrix, risk_free_rate),
        method="SLSQP",
        bounds=bounds,
        constraints=constraints
    )

    if not result.success:
        raise OptimizationError(
            "Could not find a valid portfolio under the given constraints. "
            "This usually means the volatility cap is too tight for the selected stocks. "
            "Try a less conservative risk profile or different tickers."
        )

    return result.x