import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Signal } from '../types';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  signals: Signal[];
}

export function PriceChart({ signals }: PriceChartProps) {
  const data = {
    labels: signals.map(s => format(new Date(s.timestamp), 'MMM d, yyyy')),
    datasets: [
      {
        label: 'Price',
        data: signals.map(s => s.price),
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        fill: false,
      },
      {
        label: 'Buy Signals',
        data: signals.map(s => s.signal === 1 ? s.price : null),
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointRadius: 6,
        showLine: false,
      },
      {
        label: 'Sell Signals',
        data: signals.map(s => s.signal === 0 ? s.price : null),
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointRadius: 6,
        showLine: false,
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
        text: 'Stock Price & Trading Signals',
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