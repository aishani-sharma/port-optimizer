# backend/models/schemas.py
from pydantic import BaseModel
from typing import List


class PortfolioRequest(BaseModel):
    tickers: List[str]
    period: str = "1y"
    interval: str = "1d"


class PortfolioResponse(BaseModel):
    weights: dict[str, float]
    expected_return: float
    volatility: float
    sharpe_ratio: float

class MonteCarloRequest(BaseModel):
    tickers: List[str]
    period: str = "1y"
    interval: str = "1d"
    num_portfolios: int = 5000


class SimulatedPortfolio(BaseModel):
    weights: dict[str, float]
    expected_return: float
    volatility: float
    sharpe_ratio: float


class MonteCarloResponse(BaseModel):
    simulations: List[SimulatedPortfolio]
    best_sharpe_portfolio: SimulatedPortfolio


class SimulatedPoint(BaseModel):
    expected_return: float
    volatility: float
    sharpe_ratio: float


class MonteCarloResponse(BaseModel):
    simulations: List[SimulatedPoint]          # lightweight — just for scatter plot
    best_sharpe_portfolio: SimulatedPortfolio   # full detail, including weights