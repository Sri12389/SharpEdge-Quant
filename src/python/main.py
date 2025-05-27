#!/usr/bin/env python3
"""
Main entry point for the quant trading platform.
Integrates Python signal generation with C++ backtesting.
"""

import os
import sys
import argparse
import logging
import pandas as pd
from datetime import datetime
import matplotlib.pyplot as plt

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('trading_platform')

# Import local modules
from data_ingestion import DataIngestion
from signal_generation import SignalGenerator

# Import C++ module
try:
    sys.path.append('build')
    import quant_cpp_engine as cpp
    logger.info("C++ engine loaded successfully")
except ImportError as e:
    logger.error(f"Failed to import C++ engine: {str(e)}")
    logger.error("Make sure to build the C++ module first: mkdir -p build && cd build && cmake .. && make")
    cpp = None

class TradingPlatform:
    """Main class for the quant trading platform."""
    
    def __init__(self, data_dir='data'):
        """Initialize the trading platform.
        
        Args:
            data_dir (str): Directory for data files
        """
        self.data_dir = data_dir
        self.data_ingestion = DataIngestion(data_dir)
        self.signal_generator = None
        os.makedirs(data_dir, exist_ok=True)
    
    def ingest_data(self, ticker, start_date=None, end_date=None, period='1y'):
        """Ingest historical price data.
        
        Args:
            ticker (str): Stock ticker symbol
            start_date (str): Start date in YYYY-MM-DD format
            end_date (str): End date in YYYY-MM-DD format
            period (str): Period to fetch (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            
        Returns:
            str: Path to the saved CSV file
        """
        data = self.data_ingestion.fetch_data(ticker, start_date, end_date, period)
        if data is not None:
            return self.data_ingestion.save_data(data, ticker)
        return None
    
    def generate_signals(self, price_data_path, model_type='random_forest', ticker='STOCK'):
        """Generate trading signals.
        
        Args:
            price_data_path (str): Path to CSV file with price data
            model_type (str): Type of ML model to use
            ticker (str): Stock ticker symbol
            
        Returns:
            str: Path to the saved signals CSV file
        """
        # Load price data
        try:
            price_data = pd.read_csv(price_data_path, index_col=0, parse_dates=True)
        except Exception as e:
            logger.error(f"Error loading price data: {str(e)}")
            return None
        
        # Create signal generator
        self.signal_generator = SignalGenerator(model_type, self.data_dir)
        
        # Train model
        self.signal_generator.train(price_data)
        
        # Generate signals
        signals = self.signal_generator.generate_signals(price_data)
        
        # Save signals
        if signals is not None:
            return self.signal_generator.save_signals(signals, ticker)
        return None
    
    def run_backtest(self, signals_path, initial_capital=10000.0, slippage=0.0005, latency=0.0):
        """Run backtest using C++ engine.
        
        Args:
            signals_path (str): Path to CSV file with signals
            initial_capital (float): Initial capital for the backtest
            slippage (float): Slippage model parameter
            latency (float): Latency model parameter in seconds
            
        Returns:
            dict: Backtest results
        """
        if cpp is None:
            logger.error("C++ engine not available")
            return None
        
        try:
            # Run backtest
            logger.info(f"Running backtest with signals from {signals_path}")
            results = cpp.run_backtest(signals_path, initial_capital, slippage, latency)
            
            # Print results
            logger.info(f"Backtest Results:")
            logger.info(f"  Final Return: {results['final_return']:.2f}%")
            logger.info(f"  Sharpe Ratio: {results['sharpe_ratio']:.2f}")
            logger.info(f"  Max Drawdown: {results['max_drawdown']:.2f}%")
            
            return results
        except Exception as e:
            logger.error(f"Error running backtest: {str(e)}")
            return None
    
    def visualize_results(self, signals_path, results):
        """Visualize backtest results.
        
        Args:
            signals_path (str): Path to CSV file with signals
            results (dict): Backtest results
        """
        try:
            # Load signals
            signals = pd.read_csv(signals_path, parse_dates=['timestamp'])
            
            # Create figure
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)
            
            # Plot price
            ax1.plot(signals['timestamp'], signals['price'], label='Price')
            ax1.set_title('Price and Signals')
            ax1.set_ylabel('Price')
            ax1.legend()
            
            # Plot signals
            ax2.scatter(signals['timestamp'], signals['signal'], label='Signal (1=Buy, 0=Sell)')
            ax2.set_title('Trading Signals')
            ax2.set_ylabel('Signal')
            ax2.set_xlabel('Date')
            ax2.set_yticks([0, 1])
            ax2.legend()
            
            # Add backtest results as text
            if results:
                text = (
                    f"Final Return: {results['final_return']:.2f}%\n"
                    f"Sharpe Ratio: {results['sharpe_ratio']:.2f}\n"
                    f"Max Drawdown: {results['max_drawdown']:.2f}%"
                )
                fig.text(0.02, 0.02, text, fontsize=10)
            
            # Adjust layout
            plt.tight_layout()
            
            # Save figure
            output_path = os.path.join(self.data_dir, 'backtest_results.png')
            plt.savefig(output_path)
            logger.info(f"Results visualization saved to {output_path}")
            
            # Show figure
            plt.show()
        except Exception as e:
            logger.error(f"Error visualizing results: {str(e)}")

def main():
    """Main function to run the trading platform from command line."""
    parser = argparse.ArgumentParser(description='Quant Trading Platform')
    parser.add_argument('--ticker', type=str, default='AAPL', help='Stock ticker symbol')
    parser.add_argument('--start', type=str, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end', type=str, help='End date (YYYY-MM-DD)')
    parser.add_argument('--period', type=str, default='1y', help='Period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)')
    parser.add_argument('--model', type=str, default='random_forest', choices=['random_forest', 'logistic_regression'], help='ML model to use')
    parser.add_argument('--capital', type=float, default=10000.0, help='Initial capital for backtest')
    parser.add_argument('--slippage', type=float, default=0.0005, help='Slippage parameter')
    parser.add_argument('--latency', type=float, default=0.0, help='Latency parameter in seconds')
    parser.add_argument('--skip-download', action='store_true', help='Skip data download')
    parser.add_argument('--skip-signals', action='store_true', help='Skip signal generation')
    parser.add_argument('--price-data', type=str, help='Path to price data CSV')
    parser.add_argument('--signal-data', type=str, help='Path to signal data CSV')
    args = parser.parse_args()
    
    # Create trading platform
    platform = TradingPlatform()
    
    # Data ingestion
    price_data_path = args.price_data
    if not args.skip_download and not price_data_path:
        price_data_path = platform.ingest_data(args.ticker, args.start, args.end, args.period)
        if not price_data_path:
            logger.error("Failed to ingest data")
            return
    
    # Signal generation
    signals_path = args.signal_data
    if not args.skip_signals and not signals_path and price_data_path:
        signals_path = platform.generate_signals(price_data_path, args.model, args.ticker)
        if not signals_path:
            logger.error("Failed to generate signals")
            return
    
    # Run backtest
    if signals_path:
        results = platform.run_backtest(signals_path, args.capital, args.slippage, args.latency)
        if results:
            platform.visualize_results(signals_path, results)

if __name__ == "__main__":
    main()