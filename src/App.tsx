import { useState, useEffect } from 'react';
import { LineChart, TrendingUp, Settings, BarChart2, Activity, Clock, ArrowRight } from 'lucide-react';
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
  const [isConfigOpen, setIsConfigOpen] = useState(false);

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

  const handleRunBacktest = async () => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <LineChart className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">SharpEdge</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
            <BarChart2 className="w-5 h-5" />
            Dashboard
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
            <Activity className="w-5 h-5" />
            Strategies
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5" />
            History
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Trading Dashboard</h2>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.email}
              </span>
              <StrategySelector strategy={strategy} onStrategyChange={setStrategy} />
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {!results ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <TrendingUp className="w-16 h-16 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Ready to Start Trading?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Configure your strategy parameters and run a backtest to see performance metrics, charts, and trading signals.
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setIsConfigOpen(!isConfigOpen)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Strategy
                    </button>
                    <button
                      onClick={handleRunBacktest}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Run Backtest
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>

                  {isConfigOpen && (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <div className="max-w-sm mx-auto space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Initial Capital
                          </label>
                          <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            defaultValue="10000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Risk Tolerance (%)
                          </label>
                          <input
                            type="range"
                            className="w-full"
                            min="1"
                            max="100"
                            defaultValue="50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {results?.performance && (
                <PerformanceMetrics metrics={results.performance} />
              )}
              <div className="grid grid-cols-1 gap-6">
                {results?.signals && <PriceChart signals={results.signals} />}
                {results?.equityCurve && <EquityChart equityCurve={results.equityCurve} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;