export interface Signal {
  timestamp: string;
  price: number;
  signal: number;
}

export interface PerformanceMetrics {
  return: number;
  sharpe: number;
  drawdown: number;
}

export interface EquityPoint {
  timestamp: string;
  value: number;
}

export interface BacktestResults {
  signals: Signal[];
  performance: PerformanceMetrics;
  equityCurve: EquityPoint[];
}