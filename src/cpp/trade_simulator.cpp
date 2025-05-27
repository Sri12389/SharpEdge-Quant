#include "trade_simulator.h"
#include <algorithm>
#include <cmath>

TradeSimulator::TradeSimulator(double slippage, double latency)
    : m_slippage(slippage), m_latency(latency) {}

double TradeSimulator::calculateBuyPrice(double basePrice) const {
    // Apply slippage to buy price (higher)
    return basePrice * (1.0 + m_slippage);
}

double TradeSimulator::calculateSellPrice(double basePrice) const {
    // Apply slippage to sell price (lower)
    return basePrice * (1.0 - m_slippage);
}

Signal TradeSimulator::applyLatency(const Signal& original, const std::vector<Signal>& signals, size_t currentIndex) const {
    if (m_latency <= 0.0 || signals.empty() || currentIndex >= signals.size() - 1) {
        return original;
    }
    
    // Calculate how many steps to delay
    // Assume each step is 0.1 seconds for simplicity
    size_t latencySteps = static_cast<size_t>(m_latency * 10);
    
    // Get the delayed signal
    size_t delayedIndex = std::min(currentIndex + latencySteps, signals.size() - 1);
    
    // Create a new signal with the original timestamp but delayed price
    Signal delayedSignal = original;
    delayedSignal.price = signals[delayedIndex].price;
    
    return delayedSignal;
}

std::vector<Trade> TradeSimulator::simulateTrades(const std::vector<Signal>& signals) const {
    std::vector<Trade> trades;
    
    if (signals.empty()) {
        return trades;
    }
    
    int currentPosition = 0;
    int lastSignal = 0;
    
    for (size_t i = 0; i < signals.size(); ++i) {
        // Apply latency to get effective signal
        Signal effectiveSignal = applyLatency(signals[i], signals, i);
        
        // If signal has changed, execute a trade
        if (effectiveSignal.signal != lastSignal) {
            if (effectiveSignal.signal == 1 && currentPosition == 0) {
                // Buy signal
                double tradePrice = calculateBuyPrice(effectiveSignal.price);
                int shares = static_cast<int>(10000.0 / tradePrice);  // Simplified position sizing
                
                Trade trade;
                trade.timestamp = effectiveSignal.timestamp;
                trade.action = "BUY";
                trade.shares = shares;
                trade.price = tradePrice;
                trade.value = shares * tradePrice;
                
                trades.push_back(trade);
                currentPosition = shares;
            } else if (effectiveSignal.signal == 0 && currentPosition > 0) {
                // Sell signal
                double tradePrice = calculateSellPrice(effectiveSignal.price);
                
                Trade trade;
                trade.timestamp = effectiveSignal.timestamp;
                trade.action = "SELL";
                trade.shares = currentPosition;
                trade.price = tradePrice;
                trade.value = currentPosition * tradePrice;
                
                trades.push_back(trade);
                currentPosition = 0;
            }
            
            lastSignal = effectiveSignal.signal;
        }
    }
    
    return trades;
}