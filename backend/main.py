from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stocks, portfolio

app = FastAPI(title="Portfolio Optimizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router)
app.include_router(portfolio.router)

@app.get("/")
def root():
    return {"message": "Portfolio Optimizer API"}