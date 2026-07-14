# Portfolio Optimizer using Modern Portfolio Theory (MPT)

A financial analytics application that helps investors build an optimal stock portfolio by balancing risk and return, using Modern Portfolio Theory.

## What it does

Instead of predicting future stock prices, this tool analyzes historical market data for a user-selected set of stocks and recommends an optimal allocation based on risk/return trade-offs.

Core concepts implemented:
- Expected return and portfolio volatility (risk)
- Sharpe Ratio optimization via constrained numerical optimization (SciPy)
- Monte Carlo simulation of thousands of random portfolio combinations
- Efficient Frontier visualization

## Tech Stack

**Backend:** Python, FastAPI, NumPy, Pandas, SciPy, yFinance
**Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts, Axios

## Project Structure

```
portfolio-optimizer/
├── backend/
│   ├── main.py
│   ├── routers/        # API endpoints (stocks, portfolio)
│   ├── services/        # Business logic (data fetching, metrics, optimization, simulation)
│   ├── models/           # Pydantic request/response schemas
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/          # Axios client
        ├── components/   # React components
        └── types/        # TypeScript interfaces
```

## How it works

1. User submits a list of stock tickers
2. Backend fetches historical price data via yFinance
3. Daily returns, annualized returns, and the covariance matrix are computed
4. SciPy's constrained optimizer finds the portfolio weights that maximize the Sharpe Ratio
5. In parallel, a Monte Carlo simulation generates thousands of random portfolios to visualize the risk/return landscape
6. Results are returned to the frontend and rendered as allocation breakdowns and an Efficient Frontier scatter plot

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```
Visit `localhost:8000/docs` for interactive API documentation.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /stocks/prices` — fetch historical price data for given tickers
- `POST /portfolio/optimize` — returns the max-Sharpe-ratio optimal portfolio allocation
- `POST /portfolio/simulate` — runs a Monte Carlo simulation and returns simulated portfolios plus the best one found