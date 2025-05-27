#ifndef TRADE_SIMULATOR_H
#define TRADE_SIMULATOR_H

#include <vector>
#include "backtester.h"  // For Signal and Trade structures

/**
 * TradeSimulator class for simulating realistic trading conditions
 */
class TradeSimulator {
public:
    /**
     * Constructor
     * 
     * @param slippage Slippage parameter (0.001 = 0.1%)
     * @param latency Latency parameter in seconds
     */
    TradeSimulator(double slippage, double latency);
    
    /**
     * Calculate buy price with slippage
     * 
     * @param basePrice Base price
     * @return Adjusted price
     */
    double calculateBuyPrice(double basePrice) const;
    
    /**
     * Calculate sell price with slippage
     * 
     * @param basePrice Base price
     * @return Adjusted price
     */
    double calculateSellPrice(double basePrice) const;
    
    /**
     * Apply latency to a signal
     * 
     * @param original Original signal
     * @param signals All signals
     * @param currentIndex Current index in signals
     * @return Adjusted signal
     */
    Signal applyLatency(const Signal& original, const std::vector<Signal>& signals, size_t currentIndex) const;
    
    /**
     * Simulate trades based on signals
     * 
     * @param signals Vector of signals
     * @return Vector of trades
     */
    std::vector<Trade> simulateTrades(const std::vector<Signal>& signals) const;
    
private:
    double m_slippage;
    double m_latency;
};

#endif // TRADE_SIMULATOR_H