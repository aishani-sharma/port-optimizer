# backend/models/schemas.py
from pydantic import BaseModel
from typing import List


class PortfolioRequest(BaseModel):
    tickers: List[str]
    period: str = "1y"
    interval: str = "1d"
    max_weight: float = 1.0
    max_volatility: float | None = None


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


class SimulatedPoint(BaseModel):
    expected_return: float
    volatility: float
    sharpe_ratio: float


class MonteCarloResponse(BaseModel):
    simulations: List[SimulatedPoint]          # lightweight — just for scatter plot
    best_sharpe_portfolio: SimulatedPortfolio   # full detail, including weights


class StockInfoRequest(BaseModel):
    tickers: List[str]


class StockInfo(BaseModel):
    symbol: str
    name: str
    sector: str
    currency: str
    market_cap: float | None
    current_price: float | None
    one_year_return: float
    volatility: float


class StockInfoResponse(BaseModel):
    stocks: List[StockInfo]