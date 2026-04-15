// components/dashboard/analytics.js
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Card from './card';
import { mockBarData, mockPieData } from '@/lib/mockdata';

const COLORS = ['#3b82f6', '#eab308', '#10b981', '#ef4444'];

export default function Analytics() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Analytics Overview</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Applications per week</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockBarData} margin={{ top: 10, right: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#3b82f6" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Application status distribution</p>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}