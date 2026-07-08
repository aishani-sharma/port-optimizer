# Portfolio Optimizer using Modern Portfolio Theory (MPT)

A financial analytics application that helps investors build an optimal stock portfolio by balancing risk and return, using Modern Portfolio Theory.

## What it does

Instead of predicting future stock prices, this tool analyzes historical market data for a user-selected set of stocks and recommends an optimal allocation based on risk/return trade-offs.

Core concepts implemented:
- Expected return and portfolio volatility (risk)
- Sharpe Ratio optimization
- Efficient Frontier generation
- Monte Carlo simulation of portfolio combinations

## Tech Stack

**Backend:** Python, FastAPI, NumPy, Pandas, SciPy, yFinance
**Frontend:** React, Vite

## Project Structure
portfolio-optimizer/
├── backend/
│   ├── main.py
│   ├── routers/       # API endpoints
│   ├── services/       # Business logic (finance calculations)
│   ├── models/         # Pydantic request/response schemas
│   └── requirements.txt
└── frontend/
## Setup

### Backend
\`\`\`bash
cd backend
python -m venv venv
venv\Scripts\activate   # or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`
Visit `localhost:8000/docs` for the interactive API docs.

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
