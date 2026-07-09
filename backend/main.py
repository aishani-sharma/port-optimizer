from fastapi import FastAPI
from routers import stocks, portfolio

app = FastAPI(title="Portfolio Optimizer API")

app.include_router(stocks.router)
app.include_router(portfolio.router)

@app.get("/")
def root():
    return {"message": "Portfolio Optimizer API"}