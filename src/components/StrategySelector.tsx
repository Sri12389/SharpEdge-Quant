import { ChevronDown } from 'lucide-react';

interface StrategySelectorProps {
  strategy: string;
  onStrategyChange: (strategy: string) => void;
}

export function StrategySelector({ strategy, onStrategyChange }: StrategySelectorProps) {
  return (
    <div className="relative inline-block">
      <select
        value={strategy}
        onChange={(e) => onStrategyChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-blue-500 shadow-sm"
      >
        <option value="random_forest">Random Forest</option>
        <option value="logistic_regression">Logistic Regression</option>
        <option value="lstm">LSTM</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}