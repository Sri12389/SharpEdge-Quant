import { PerformanceMetrics as Metrics } from '../types';
import { TrendingUp, Sigma, TrendingDown } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: Metrics;
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-700">Return</h3>
        </div>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          {(metrics.return * 100).toFixed(2)}%
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <Sigma className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-700">Sharpe Ratio</h3>
        </div>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          {metrics.sharpe.toFixed(2)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <TrendingDown className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-700">Max Drawdown</h3>
        </div>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          {(metrics.drawdown * 100).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}