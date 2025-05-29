import { useState, useEffect } from 'react';
import { LineChart, TrendingUp } from 'lucide-react';
import { StrategySelector } from './components/StrategySelector';
import { PriceChart } from './components/PriceChart';
import { EquityChart } from './components/EquityChart';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import { BacktestResults } from './types';

function App() {
  const [strategy, setStrategy] = useState('random_forest');
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LineChart className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              SharpEdge Quant Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {session.user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-red-600 hover:text-red-500"
            >
              Sign out
            </button>
            <StrategySelector strategy={strategy} onStrategyChange={setStrategy} />
          </div>
        </div>

        {/* Performance Metrics */}
        {results?.performance && (
          <PerformanceMetrics metrics={results.performance} />
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          {results?.signals && <PriceChart signals={results.signals} />}
          {results?.equityCurve && <EquityChart equityCurve={results.equityCurve} />}
        </div>

        {/* Status */}
        {!results && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No backtest results available. Run a backtest to see performance metrics and charts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;