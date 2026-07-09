from fastapi import FastAPI
from routers import stocks

app = FastAPI(title="Portfolio Optimizer API")

app.include_router(stocks.router)

@app.get("/")
def root():
    return {"message": "Portfolio Optimizer API"}