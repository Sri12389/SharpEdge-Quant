#include "performance_metrics.h"
#include <algorithm>
#include <cmath>
#include <numeric>

double PerformanceMetrics::calculateTotalReturn(const std::vector<EquityPoint>& equity, double initialCapital) {
    if (equity.empty()) {
        return 0.0;
    }
    
    double finalEquity = equity.back().equity;
    return (finalEquity / initialCapital - 1.0) * 100.0;
}

double PerformanceMetrics::calculateMaxDrawdown(const std::vector<double>& equityValues) {
    if (equityValues.empty()) {
        return 0.0;
    }
    
    double maxDrawdown = 0.0;
    double peak = equityValues[0];
    
    for (double value : equityValues) {
        if (value > peak) {
            peak = value;
        }
        
        double drawdown = (peak - value) / peak * 100.0;
        maxDrawdown = std::max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
}

double PerformanceMetrics::calculateSharpeRatio(const std::vector<double>& returns, double riskFreeRate) {
    if (returns.empty()) {
        return 0.0;
    }
    
    // Calculate mean return
    double sum = std::accumulate(returns.begin(), returns.end(), 0.0);
    double mean = sum / returns.size();
    
    // Calculate standard deviation
    double squaredSum = 0.0;
    for (double ret : returns) {
        squaredSum += (ret - mean) * (ret - mean);
    }
    double stdDev = std::sqrt(squaredSum / returns.size());
    
    // Avoid division by zero
    if (stdDev == 0.0) {
        return 0.0;
    }
    
    // Calculate daily Sharpe ratio
    double dailySharpe = (mean - riskFreeRate / 252.0) / stdDev;
    
    // Annualize (assuming 252 trading days)
    return dailySharpe * std::sqrt(252.0);
}

double PerformanceMetrics::calculateSortinoRatio(const std::vector<double>& returns, double riskFreeRate) {
    if (returns.empty()) {
        return 0.0;
    }
    
    // Calculate mean return
    double sum = std::accumulate(returns.begin(), returns.end(), 0.0);
    double mean = sum / returns.size();
    
    // Calculate downside deviation (only negative returns)
    double squaredDownsideSum = 0.0;
    int downsideCount = 0;
    
    for (double ret : returns) {
        if (ret < 0) {
            squaredDownsideSum += ret * ret;
            downsideCount++;
        }
    }
    
    // Avoid division by zero
    if (downsideCount == 0) {
        return 0.0;
    }
    
    double downsideDeviation = std::sqrt(squaredDownsideSum / downsideCount);
    
    // Calculate daily Sortino ratio
    double dailySortino = (mean - riskFreeRate / 252.0) / downsideDeviation;
    
    // Annualize (assuming 252 trading days)
    return dailySortino * std::sqrt(252.0);
}

PerformanceStats PerformanceMetrics::calculateAllMetrics(
    const std::vector<EquityPoint>& equity,
    const std::vector<double>& returns,
    double initialCapital,
    double riskFreeRate
) {
    PerformanceStats stats;
    
    if (equity.empty() || returns.empty()) {
        return stats;
    }
    
    // Extract equity values for calculations
    std::vector<double> equityValues;
    for (const auto& point : equity) {
        equityValues.push_back(point.equity);
    }
    
    // Calculate metrics
    stats.totalReturn = calculateTotalReturn(equity, initialCapital);
    stats.maxDrawdown = calculateMaxDrawdown(equityValues);
    stats.sharpeRatio = calculateSharpeRatio(returns, riskFreeRate);
    stats.sortinoRatio = calculateSortinoRatio(returns, riskFreeRate);
    
    // Calculate annualized return
    double years = static_cast<double>(returns.size()) / 252.0;
    if (years > 0) {
        stats.annualizedReturn = std::pow(1.0 + stats.totalReturn / 100.0, 1.0 / years) - 1.0;
        stats.annualizedReturn *= 100.0;
    }
    
    return stats;
}