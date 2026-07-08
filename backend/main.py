from fastapi import FastAPI

app = FastAPI(title="Portfolio Optimizer API")

@app.get("/")
def root():
    return {"message": "Portfolio Optimizer API"}