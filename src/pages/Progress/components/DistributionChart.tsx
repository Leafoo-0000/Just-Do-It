import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Award } from 'lucide-react';
import { DistributionDataPoint, Habit } from '../types';

interface DistributionChartProps {
  data: DistributionDataPoint[];
  habits: Habit[];
}

export function DistributionChart({ data, habits }: DistributionChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Habit Types
          </h3>
          <p className="text-sm text-gray-500 mt-1">Daily vs Weekly distribution</p>
        </div>
      </div>
      <div className="h-64 min-h-[256px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No habits created
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600">
            {habits.filter(h => h.frequency === 'daily').length}
          </p>
          <p className="text-sm text-green-700">Daily Habits</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-blue-600">
            {habits.filter(h => h.frequency === 'weekly').length}
          </p>
          <p className="text-sm text-blue-700">Weekly Habits</p>
        </div>
      </div>
    </div>
  );
}