from fastapi import APIRouter
from services.data_fetcher import fetch_price_data
from models.schemas import StockInfoRequest, StockInfoResponse
from services.stock_info import get_stock_info

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.post("/info", response_model=StockInfoResponse)
def get_stocks_info(request: StockInfoRequest):
    stocks_data = get_stock_info(request.tickers)
    return StockInfoResponse(stocks=stocks_data)



@router.get("/prices")
def get_prices(tickers: str, period: str = "1y", interval: str = "1d"):
    """
    Example: /stocks/prices?tickers=AAPL,MSFT,GOOGL&period=1y&interval=1d
    """
    ticker_list = [t.strip().upper() for t in tickers.split(",")]

    df = fetch_price_data(ticker_list, period=period, interval=interval)

    # Convert DataFrame to a JSON-friendly format
    # orient="index" -> {date: {ticker: price, ...}, ...}
    result = df.to_dict(orient="index")

    return {
        "tickers": ticker_list,
        "period": period,
        "interval": interval,
        "data": result
    }