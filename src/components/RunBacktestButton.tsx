import { ArrowRight } from 'lucide-react';

interface RunBacktestButtonProps {
  onComplete: (results: any) => void;
}

export function RunBacktestButton({ onComplete }: RunBacktestButtonProps) {
  const runBacktest = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'AAPL' }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to run backtest');
      }
      
      const data = await res.json();
      onComplete(data);
    } catch (error) {
      console.error('Backtest error:', error);
    }
  };

  return (
    <button
      onClick={runBacktest}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
    >
      Run Backtest
      <ArrowRight className="w-4 h-4 ml-2" />
    </button>
  );
}