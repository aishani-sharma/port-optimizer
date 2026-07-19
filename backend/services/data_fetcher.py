import yfinance as yf
import pandas as pd


def fetch_price_data(
    tickers: list[str],
    period: str = "1y",
    interval: str = "1d"
) -> pd.DataFrame:
    """
    Fetch historical adjusted close prices for a list of tickers.

    Args:
        tickers: list of stock symbols, e.g. ["AAPL", "MSFT"]
        period: how far back to fetch data, e.g. "1y", "6mo", "5y"
        interval: candle interval, e.g. "1d", "1wk"

    Returns:
        A DataFrame with dates as index, tickers as columns,
        and adjusted close prices as values.
    """
    raw_data = yf.download(
        tickers=tickers,
        period=period,
        interval=interval,
        auto_adjust=True,   # adjusts for splits/dividends, gives "Close" already adjusted
        group_by="ticker"   # keeps multi-ticker output organized per ticker
    )

    # When tickers are downloaded with group_by="ticker", yfinance returns a MultiIndex column
    # structure like (ticker, price_type). We only want the "Close" column
    # for each ticker, flattened into a simple DataFrame.
    # Note: This is true even for a single ticker when group_by="ticker" is used.
    # We build the DataFrame defensively checking the column structure.
    close_prices = pd.DataFrame()
    for ticker in tickers:
        try:
            if isinstance(raw_data.columns, pd.MultiIndex):
                if ticker in raw_data:
                    close_prices[ticker] = raw_data[ticker]["Close"]
            else:
                if "Close" in raw_data:
                    close_prices[ticker] = raw_data["Close"]
                elif ticker in raw_data:
                    close_prices[ticker] = raw_data[ticker]
        except Exception:
            pass

    # Drop rows where ANY ticker has missing data (e.g. one stock didn't
    # trade that day, or IPO'd later than others) — keeps all columns aligned
    close_prices = close_prices.dropna()

    return close_prices


if __name__ == "__main__":
    tickers = ["AAPL", "MSFT", "GOOGL"]
    df = fetch_price_data(tickers, period="1y", interval="1d")

    print(df.head())
    print("\nShape:", df.shape)
    print("\nColumns:", df.columns.tolist())
    print("\nAny nulls left?", df.isnull().values.any())