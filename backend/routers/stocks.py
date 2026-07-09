from fastapi import APIRouter
from services.data_fetcher import fetch_price_data

router = APIRouter(prefix="/stocks", tags=["stocks"])


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