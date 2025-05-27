import { useState } from 'react';
import { LineChart } from 'lucide-react';

function App() {
  const [strategy, setStrategy] = useState('random_forest');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <LineChart className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Quant Trading Dashboard
          </h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600">
            Selected Strategy: {strategy}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;