from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_sample_data():
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='1D')
    np.random.seed(42)
    
    # Generate price data with trend and noise
    base_price = 150
    trend = np.linspace(0, 20, len(dates))
    noise = np.random.normal(0, 2, len(dates))
    prices = base_price + trend + noise
    
    df = pd.DataFrame({
        'timestamp': dates,
        'open': prices,
        'high': prices + np.random.uniform(0, 2, len(dates)),
        'low': prices - np.random.uniform(0, 2, len(dates)),
        'close': prices + np.random.normal(0, 1, len(dates)),
        'volume': np.random.uniform(1000000, 5000000, len(dates))
    })
    
    return df

@app.post("/api/backtest")
async def run_backtest(req: Request):
    body = await req.json()
    symbol = body.get("symbol", "AAPL")
    
    # Generate sample data
    df = generate_sample_data()
    
    # Simple buy-and-hold strategy
    initial_balance = 10000
    shares = initial_balance / df['close'].iloc[0]
    final_balance = shares * df['close'].iloc[-1]
    
    return {
        "symbol": symbol,
        "initial_balance": initial_balance,
        "final_balance": round(final_balance, 2),
        "return_pct": round((final_balance / initial_balance - 1) * 100, 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)