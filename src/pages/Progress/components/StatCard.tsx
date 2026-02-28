import { ReactNode } from 'react';

interface StatCardProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string | number;
  readonly subtext: string;
  readonly trend: string;
  readonly trendUp: boolean;
  readonly highlight?: boolean;
}

export function StatCard({ icon, label, value, subtext, trend, trendUp, highlight }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ${highlight ? 'ring-2 ring-orange-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trendUp ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}