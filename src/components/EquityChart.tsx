import { Line } from 'react-chartjs-2';
import { EquityPoint } from '../types';
import { format } from 'date-fns';

interface EquityChartProps {
  equityCurve: EquityPoint[];
}

export function EquityChart({ equityCurve }: EquityChartProps) {
  const data = {
    labels: equityCurve.map(p => format(new Date(p.timestamp), 'MMM d, yyyy')),
    datasets: [
      {
        label: 'Portfolio Value',
        data: equityCurve.map(p => p.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Portfolio Equity Curve',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <Line data={data} options={options} />
    </div>
  );
}