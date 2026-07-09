# backend/routers/portfolio.py
from fastapi import APIRouter
from models.schemas import PortfolioRequest, PortfolioResponse
from services.data_fetcher import fetch_price_data
from services.metrics import (
    calculate_daily_returns,
    calculate_annual_returns,
    calculate_covariance_matrix,
    calculate_portfolio_return,
    calculate_portfolio_volatility,
    calculate_sharpe_ratio,
)
from services.optimizer import optimize_max_sharpe
from models.schemas import MonteCarloRequest, MonteCarloResponse, SimulatedPortfolio
from services.monte_carlo import run_monte_carlo_simulation
router=APIRouter()

@router.post("/simulate", response_model=MonteCarloResponse)
def simulate_portfolios(request: MonteCarloRequest):
    prices = fetch_price_data(request.tickers, period=request.period, interval=request.interval)

    daily_returns = calculate_daily_returns(prices)
    annual_returns = calculate_annual_returns(daily_returns)
    cov_matrix = calculate_covariance_matrix(daily_returns)

    results_df = run_monte_carlo_simulation(
        annual_returns, cov_matrix, num_portfolios=request.num_portfolios
    )

    simulations = []
    for _, row in results_df.iterrows():
        weights_dict = {ticker: float(row[ticker]) for ticker in request.tickers}
        simulations.append(SimulatedPortfolio(
            weights=weights_dict,
            expected_return=float(row["return"]),
            volatility=float(row["volatility"]),
            sharpe_ratio=float(row["sharpe"]),
        ))

    best_idx = results_df["sharpe"].idxmax()
    best_row = results_df.loc[best_idx]
    best_portfolio = SimulatedPortfolio(
        weights={ticker: float(best_row[ticker]) for ticker in request.tickers},
        expected_return=float(best_row["return"]),
        volatility=float(best_row["volatility"]),
        sharpe_ratio=float(best_row["sharpe"]),
    )

    return MonteCarloResponse(simulations=simulations, best_sharpe_portfolio=best_portfolio)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.post("/optimize", response_model=PortfolioResponse)
def optimize_portfolio(request: PortfolioRequest):
    prices = fetch_price_data(request.tickers, period=request.period, interval=request.interval)

    daily_returns = calculate_daily_returns(prices)
    annual_returns = calculate_annual_returns(daily_returns)
    cov_matrix = calculate_covariance_matrix(daily_returns)

    optimal_weights = optimize_max_sharpe(annual_returns, cov_matrix)

    port_return = calculate_portfolio_return(optimal_weights, annual_returns)
    port_volatility = calculate_portfolio_volatility(optimal_weights, cov_matrix)
    sharpe = calculate_sharpe_ratio(port_return, port_volatility)

    weights_dict = {
        ticker: float(weight) for ticker, weight in zip(request.tickers, optimal_weights)
    }

    return PortfolioResponse(
        weights=weights_dict,
        expected_return=float(port_return),
        volatility=float(port_volatility),
        sharpe_ratio=float(sharpe),
    )
