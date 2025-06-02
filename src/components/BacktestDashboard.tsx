import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { BacktestResults, EquityPoint, Trade } from '../types';
import { ErrorBoundary } from './ErrorBoundary';

interface Metrics {
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
      <p className="text-red-600">{error.message}</p>
    </div>
  );
}

function Dashboard() {
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBacktestResults() {
      try {
        const { data: results, error: fetchError } = await supabase
          .from('backtest_results')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) throw fetchError;

        if (results) {
          setEquityCurve(results.equity_curve);
          setMetrics({
            sharpe: results.metrics.sharpe_ratio,
            maxDrawdown: results.metrics.max_drawdown,
            winRate: (results.metrics.win_rate * 100),
            totalTrades: results.metrics.total_trades
          });
          setTrades(results.trades);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch backtest results');
      } finally {
        setLoading(false);
      }
    }

    fetchBacktestResults();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 p-6">
      {/* Equity Curve */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Equity Curve</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={equityCurve}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(timestamp) => format(new Date(timestamp), 'MMM d, yyyy')}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Portfolio Value']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-2">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          {metrics && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Sharpe Ratio</p>
                <p className="text-2xl font-semibold">{metrics.sharpe.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Max Drawdown</p>
                <p className="text-2xl font-semibold text-red-600">
                  {metrics.maxDrawdown.toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Win Rate</p>
                <p className="text-2xl font-semibold">
                  {metrics.winRate.toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Trades</p>
                <p className="text-2xl font-semibold">{metrics.totalTrades}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade Log */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Trades</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Size</th>
                  <th className="px-3 py-2">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trades.slice(0, 5).map((trade, i) => (
                  <tr key={i} className="text-sm">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {format(new Date(trade.timestamp), 'MMM d HH:mm')}
                    </td>
                    <td className={`px-3 py-2 font-medium ${
                      trade.action === 'BUY' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.action}
                    </td>
                    <td className="px-3 py-2">${trade.price.toFixed(2)}</td>
                    <td className="px-3 py-2">{trade.shares}</td>
                    <td className="px-3 py-2">${trade.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BacktestDashboard() {
  return (
    <ErrorBoundary fallback={<ErrorFallback error={new Error('Something went wrong')} />}>
      <Dashboard />
    </ErrorBoundary>
  );
}