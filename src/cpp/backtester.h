#ifndef BACKTESTER_H
#define BACKTESTER_H

#include <string>
#include <vector>

/**
 * Structure to hold signal data from CSV
 */
struct Signal {
    std::string timestamp;
    double price;
    int signal;  // 0 = no position/sell, 1 = buy
};

/**
 * Structure to hold equity value over time
 */
struct EquityPoint {
    std::string timestamp;
    double equity;
};

/**
 * Structure to hold trade information
 */
struct Trade {
    std::string timestamp;
    std::string action;  // "BUY" or "SELL"
    int shares;
    double price;
    double value;
};

/**
 * Structure to hold backtest results
 */
struct BacktestResults {
    double finalEquity = 0.0;
    double finalReturn = 0.0;
    double maxDrawdown = 0.0;
    double sharpeRatio = 0.0;
    int totalTrades = 0;
};

/**
 * Backtester class for simulating trading strategies
 */
class Backtester {
public:
    /**
     * Default constructor
     */
    Backtester();
    
    /**
     * Constructor with parameters
     * 
     * @param initialCapital Initial capital for the backtest
     * @param slippage Slippage parameter (0.001 = 0.1%)
     * @param latency Latency parameter in seconds
     */
    Backtester(double initialCapital, double slippage, double latency);
    
    /**
     * Load signals from a CSV file
     * 
     * @param filePath Path to the CSV file
     * @return True if successful, false otherwise
     */
    bool loadSignalsFromCSV(const std::string& filePath);
    
    /**
     * Run the backtest
     */
    void runBacktest();
    
    /**
     * Get the backtest results
     * 
     * @return BacktestResults structure
     */
    BacktestResults getResults() const;
    
    /**
     * Print the backtest results to standard output
     */
    void printResults() const;
    
private:
    double m_initialCapital;
    double m_cash;
    int m_position;
    double m_slippage;
    double m_latency;
    
    std::vector<Signal> m_signals;
    std::vector<EquityPoint> m_equity;
    std::vector<Trade> m_trades;
    std::vector<double> m_drawdowns;
    std::vector<double> m_returns;
};

#endif // BACKTESTER_H