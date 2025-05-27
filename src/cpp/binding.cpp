#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <string>
#include <map>
#include "backtester.h"
#include "trade_simulator.h"
#include "performance_metrics.h"

namespace py = pybind11;

/**
 * Run a backtest from Python
 * 
 * @param signalsFilePath Path to CSV file with signals
 * @param initialCapital Initial capital for the backtest
 * @param slippage Slippage parameter
 * @param latency Latency parameter in seconds
 * @return Dictionary with backtest results
 */
py::dict run_backtest(const std::string& signalsFilePath, 
                     double initialCapital = 10000.0, 
                     double slippage = 0.0005, 
                     double latency = 0.0) {
    // Create backtester
    Backtester backtester(initialCapital, slippage, latency);
    
    // Load signals
    if (!backtester.loadSignalsFromCSV(signalsFilePath)) {
        throw std::runtime_error("Failed to load signals from CSV file");
    }
    
    // Run backtest
    backtester.runBacktest();
    
    // Get results
    BacktestResults results = backtester.getResults();
    
    // Create Python dictionary with results
    py::dict resultsDict;
    resultsDict["final_equity"] = results.finalEquity;
    resultsDict["final_return"] = results.finalReturn;
    resultsDict["max_drawdown"] = results.maxDrawdown;
    resultsDict["sharpe_ratio"] = results.sharpeRatio;
    resultsDict["total_trades"] = results.totalTrades;
    
    return resultsDict;
}

PYBIND11_MODULE(quant_cpp_engine, m) {
    m.doc() = "C++ backtesting engine for quant trading platform";
    
    // Expose the run_backtest function
    m.def("run_backtest", &run_backtest, 
          py::arg("signals_file_path"),
          py::arg("initial_capital") = 10000.0,
          py::arg("slippage") = 0.0005,
          py::arg("latency") = 0.0,
          "Run a backtest with the given signals and parameters");
    
    // Expose the Backtester class
    py::class_<Backtester>(m, "Backtester")
        .def(py::init<>())
        .def(py::init<double, double, double>(), 
             py::arg("initial_capital") = 10000.0, 
             py::arg("slippage") = 0.0005, 
             py::arg("latency") = 0.0)
        .def("load_signals_from_csv", &Backtester::loadSignalsFromCSV)
        .def("run_backtest", &Backtester::runBacktest)
        .def("get_results", &Backtester::getResults)
        .def("print_results", &Backtester::printResults);
    
    // Expose the Signal struct
    py::class_<Signal>(m, "Signal")
        .def(py::init<>())
        .def_readwrite("timestamp", &Signal::timestamp)
        .def_readwrite("price", &Signal::price)
        .def_readwrite("signal", &Signal::signal);
    
    // Expose the Trade struct
    py::class_<Trade>(m, "Trade")
        .def(py::init<>())
        .def_readwrite("timestamp", &Trade::timestamp)
        .def_readwrite("action", &Trade::action)
        .def_readwrite("shares", &Trade::shares)
        .def_readwrite("price", &Trade::price)
        .def_readwrite("value", &Trade::value);
    
    // Expose the BacktestResults struct
    py::class_<BacktestResults>(m, "BacktestResults")
        .def(py::init<>())
        .def_readwrite("final_equity", &BacktestResults::finalEquity)
        .def_readwrite("final_return", &BacktestResults::finalReturn)
        .def_readwrite("max_drawdown", &BacktestResults::maxDrawdown)
        .def_readwrite("sharpe_ratio", &BacktestResults::sharpeRatio)
        .def_readwrite("total_trades", &BacktestResults::totalTrades);
}