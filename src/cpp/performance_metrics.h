#ifndef PERFORMANCE_METRICS_H
#define PERFORMANCE_METRICS_H

#include <vector>
#include "backtester.h"  // For EquityPoint structure

/**
 * Structure to hold performance statistics
 */
struct PerformanceStats {
    double totalReturn = 0.0;
    double annualizedReturn = 0.0;
    double maxDrawdown = 0.0;
    double sharpeRatio = 0.0;
    double sortinoRatio = 0.0;
};

/**
 * PerformanceMetrics class for calculating performance metrics
 */
class PerformanceMetrics {
public:
    /**
     * Calculate total return
     * 
     * @param equity Vector of equity points
     * @param initialCapital Initial capital
     * @return Total return percentage
     */
    static double calculateTotalReturn(const std::vector<EquityPoint>& equity, double initialCapital);
    
    /**
     * Calculate maximum drawdown
     * 
     * @param equityValues Vector of equity values
     * @return Maximum drawdown percentage
     */
    static double calculateMaxDrawdown(const std::vector<double>& equityValues);
    
    /**
     * Calculate Sharpe ratio
     * 
     * @param returns Vector of returns
     * @param riskFreeRate Annual risk-free rate (e.g., 0.02 for 2%)
     * @return Annualized Sharpe ratio
     */
    static double calculateSharpeRatio(const std::vector<double>& returns, double riskFreeRate = 0.0);
    
    /**
     * Calculate Sortino ratio
     * 
     * @param returns Vector of returns
     * @param riskFreeRate Annual risk-free rate (e.g., 0.02 for 2%)
     * @return Annualized Sortino ratio
     */
    static double calculateSortinoRatio(const std::vector<double>& returns, double riskFreeRate = 0.0);
    
    /**
     * Calculate all performance metrics
     * 
     * @param equity Vector of equity points
     * @param returns Vector of returns
     * @param initialCapital Initial capital
     * @param riskFreeRate Annual risk-free rate (e.g., 0.02 for 2%)
     * @return PerformanceStats structure
     */
    static PerformanceStats calculateAllMetrics(
        const std::vector<EquityPoint>& equity,
        const std::vector<double>& returns,
        double initialCapital,
        double riskFreeRate = 0.0
    );
};

#endif // PERFORMANCE_METRICS_H