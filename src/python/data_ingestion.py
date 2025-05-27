#!/usr/bin/env python3
"""
Data ingestion module for quant trading platform.
Fetches historical price data from Yahoo Finance.
"""

import os
import argparse
import logging
from datetime import datetime, timedelta
import pandas as pd
import yfinance as yf

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('data_ingestion')

class DataIngestion:
    """Handles ingestion of historical price data from yfinance."""
    
    def __init__(self, output_dir='data'):
        """Initialize the data ingestion module.
        
        Args:
            output_dir (str): Directory to store output CSV files
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
    def fetch_data(self, ticker, start_date=None, end_date=None, period='1y', interval='1d'):
        """Fetch historical price data for a given ticker.
        
        Args:
            ticker (str): Stock ticker symbol
            start_date (str): Start date in YYYY-MM-DD format
            end_date (str): End date in YYYY-MM-DD format
            period (str): Period to fetch (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval (str): Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
            
        Returns:
            pd.DataFrame: DataFrame with historical price data
        """
        logger.info(f"Fetching data for {ticker} from {start_date or period} to {end_date or 'now'}")
        
        try:
            if start_date and end_date:
                data = yf.download(ticker, start=start_date, end=end_date, interval=interval)
            else:
                data = yf.download(ticker, period=period, interval=interval)
                
            # Verify data is not empty
            if data.empty:
                logger.error(f"No data found for {ticker}")
                return None
                
            logger.info(f"Successfully fetched {len(data)} records for {ticker}")
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data: {str(e)}")
            return None
    
    def save_data(self, data, ticker, filename=None):
        """Save the fetched data to a CSV file.
        
        Args:
            data (pd.DataFrame): DataFrame with historical price data
            ticker (str): Stock ticker symbol
            filename (str, optional): Custom filename
            
        Returns:
            str: Path to the saved CSV file
        """
        if data is None or data.empty:
            logger.error("No data to save")
            return None
        
        # Generate filename if not provided
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d")
            filename = f"{ticker}_{timestamp}.csv"
            
        # Ensure the output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Generate the full path
        output_path = os.path.join(self.output_dir, filename)
        
        # Save the data
        try:
            data.to_csv(output_path)
            logger.info(f"Data saved to {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Error saving data: {str(e)}")
            return None

def main():
    """Main function to run data ingestion from command line."""
    parser = argparse.ArgumentParser(description='Fetch historical stock data')
    parser.add_argument('--ticker', type=str, required=True, help='Stock ticker symbol')
    parser.add_argument('--start', type=str, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end', type=str, help='End date (YYYY-MM-DD)')
    parser.add_argument('--period', type=str, default='1y', help='Period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)')
    parser.add_argument('--interval', type=str, default='1d', help='Interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)')
    parser.add_argument('--output', type=str, help='Output file name')
    args = parser.parse_args()
    
    ingestion = DataIngestion()
    data = ingestion.fetch_data(
        args.ticker, 
        args.start, 
        args.end, 
        args.period,
        args.interval
    )
    
    if data is not None:
        ingestion.save_data(data, args.ticker, args.output)

if __name__ == "__main__":
    main()