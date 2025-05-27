# Quant Trading Platform

A hybrid C++/Python quantitative trading platform with a focus on performance and modularity.

## Overview

This platform consists of the following components:

1. **Python Components**:
   - Historical data ingestion using yfinance
   - ML-based signal generation (logistic regression or random forest)
   - CSV export of signals

2. **C++ Components**:
   - High-performance backtesting engine
   - Trade simulation with adjustable parameters
   - Performance metrics calculation

3. **Integration**:
   - Python/C++ integration using pybind11

## Requirements

- Python 3.8+
- C++ compiler (supporting C++17)
- CMake 3.10+

## Dependencies

Python:
- numpy
- pandas
- scikit-learn
- yfinance
- matplotlib
- pybind11

C++:
- pybind11

## Project Structure

```
.
├── CMakeLists.txt         # CMake build configuration
├── README.md              # This file
├── requirements.txt       # Python dependencies
├── package.json           # Project scripts
├── data/                  # Directory for data files
└── src/
    ├── cpp/               # C++ source files
    │   ├── backtester.h
    │   ├── backtester.cpp
    │   ├── trade_simulator.h
    │   ├── trade_simulator.cpp
    │   ├── performance_metrics.h
    │   ├── performance_metrics.cpp
    │   └── binding.cpp    # pybind11 bindings
    └── python/            # Python source files
        ├── data_ingestion.py
        ├── signal_generation.py
        └── main.py        # Main entry point
```

## Getting Started

1. Install dependencies:
   ```
   npm run install-deps
   ```

2. Ingest historical data:
   ```
   npm run ingest-data -- --ticker AAPL
   ```

3. Generate trading signals:
   ```
   npm run generate-signals
   ```

4. Run a backtest:
   ```
   npm run backtest
   ```

## Usage Examples

### Data Ingestion

```bash
python src/python/data_ingestion.py --ticker AAPL --period 2y
```

### Signal Generation

```bash
python src/python/signal_generation.py --input data/AAPL_20231231.csv --model random_forest
```

### Complete Workflow

```bash
python src/python/main.py --ticker AAPL --period 2y --model random_forest --slippage 0.001
```

## Custom Parameters

- `--ticker`: Stock ticker symbol (default: AAPL)
- `--start`/`--end`: Start/end dates in YYYY-MM-DD format
- `--period`: Data period (default: 1y)
- `--model`: ML model (random_forest or logistic_regression)
- `--capital`: Initial capital for backtest (default: 10000.0)
- `--slippage`: Slippage parameter (default: 0.0005)
- `--latency`: Latency parameter in seconds (default: 0.0)

## License

MIT