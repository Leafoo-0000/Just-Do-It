import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Clock } from 'lucide-react';
import { MonthlyDataPoint } from '../types';

interface MonthlyChartProps {
  data: MonthlyDataPoint[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Monthly Performance
          </h3>
          <p className="text-sm text-gray-500 mt-1">Completion percentage by week</p>
        </div>
      </div>
      <div className="h-64 min-h-[256px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="week" 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip />
            <Bar 
              dataKey="completed" 
              name="Completion Rate"
              fill="#8b5cf6" 
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}