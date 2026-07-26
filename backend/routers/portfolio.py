# backend/routers/portfolio.py
import pandas as pd
from fastapi import APIRouter, HTTPException
from models.schemas import (
    PortfolioRequest, PortfolioResponse,
    MonteCarloRequest, MonteCarloResponse, SimulatedPortfolio, SimulatedPoint,
    BacktestRequest, BacktestResponse, BacktestPoint
)
from services.data_fetcher import fetch_price_data
from services.metrics import (
    calculate_daily_returns,
    calculate_annual_returns,
    calculate_covariance_matrix,
    calculate_portfolio_return,
    calculate_portfolio_volatility,
    calculate_sharpe_ratio,
)
from services.optimizer import optimize_max_sharpe, OptimizationError
from services.monte_carlo import run_monte_carlo_simulation
from services.backtest import run_backtest, run_benchmark_backtest, get_benchmark_ticker

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.post("/optimize", response_model=PortfolioResponse)
def optimize_portfolio(request: PortfolioRequest):
    prices = fetch_price_data(request.tickers, period=request.period, interval=request.interval)
    daily_returns = calculate_daily_returns(prices)
    annual_returns = calculate_annual_returns(daily_returns)
    cov_matrix = calculate_covariance_matrix(daily_returns)

    try:
        optimal_weights = optimize_max_sharpe(
            annual_returns,
            cov_matrix,
            max_weight=request.max_weight,
            max_volatility=request.max_volatility,
        )
    except OptimizationError as e:
        raise HTTPException(status_code=422, detail=str(e))

    port_return = calculate_portfolio_return(optimal_weights, annual_returns)
    port_volatility = calculate_portfolio_volatility(optimal_weights, cov_matrix)
    sharpe = calculate_sharpe_ratio(port_return, port_volatility)

    weights_dict = {ticker: float(weight) for ticker, weight in zip(request.tickers, optimal_weights)}

    return PortfolioResponse(
        weights=weights_dict,
        expected_return=float(port_return),
        volatility=float(port_volatility),
        sharpe_ratio=float(sharpe),
    )


@router.post("/simulate", response_model=MonteCarloResponse)
def simulate_portfolios(request: MonteCarloRequest):
    prices = fetch_price_data(request.tickers, period=request.period, interval=request.interval)
    daily_returns = calculate_daily_returns(prices)
    annual_returns = calculate_annual_returns(daily_returns)
    cov_matrix = calculate_covariance_matrix(daily_returns)

    results_df = run_monte_carlo_simulation(annual_returns, cov_matrix, num_portfolios=request.num_portfolios)

    simulations = [
        SimulatedPoint(
            expected_return=float(row["return"]),
            volatility=float(row["volatility"]),
            sharpe_ratio=float(row["sharpe"]),
        )
        for _, row in results_df.iterrows()
    ]

    best_idx = results_df["sharpe"].idxmax()
    best_row = results_df.loc[best_idx]
    best_portfolio = SimulatedPortfolio(
        weights={ticker: float(best_row[ticker]) for ticker in request.tickers},
        expected_return=float(best_row["return"]),
        volatility=float(best_row["volatility"]),
        sharpe_ratio=float(best_row["sharpe"]),
    )

    return MonteCarloResponse(simulations=simulations, best_sharpe_portfolio=best_portfolio)


@router.post("/backtest", response_model=BacktestResponse)
def backtest_portfolio(request: BacktestRequest):
    prices = fetch_price_data(request.tickers, period=request.period, interval=request.interval)

    portfolio_result = run_backtest(
        prices,
        request.weights,
        initial_investment=request.initial_investment,
        rebalance_frequency_days=request.rebalance_frequency_days,
    )

    benchmark_ticker = get_benchmark_ticker(request.tickers)
    benchmark_prices = fetch_price_data([benchmark_ticker], period=request.period, interval=request.interval)
    benchmark_result = run_benchmark_backtest(
        benchmark_prices[benchmark_ticker],
        initial_investment=request.initial_investment,
    )

    # Merge portfolio and benchmark results on date into one aligned list of points
    merged = pd.merge(portfolio_result, benchmark_result, on="date", suffixes=("_portfolio", "_benchmark"))

    points = [
        BacktestPoint(
            date=str(row["date"].date()) if hasattr(row["date"], "date") else str(row["date"])[:10],
            portfolio_value=float(row["portfolio_value_portfolio"]),
            benchmark_value=float(row["portfolio_value_benchmark"]),
        )
        for _, row in merged.iterrows()
    ]

    portfolio_final = float(merged["portfolio_value_portfolio"].iloc[-1])
    benchmark_final = float(merged["portfolio_value_benchmark"].iloc[-1])

    return BacktestResponse(
        benchmark_ticker=benchmark_ticker,
        points=points,
        portfolio_final_value=portfolio_final,
        benchmark_final_value=benchmark_final,
        portfolio_return_pct=(portfolio_final - request.initial_investment) / request.initial_investment,
        benchmark_return_pct=(benchmark_final - request.initial_investment) / request.initial_investment,
    )