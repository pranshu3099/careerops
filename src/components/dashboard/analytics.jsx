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
 
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e'];
 
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3 text-sm">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-indigo-600 font-medium mt-0.5">{payload[0].value} applications</p>
      </div>
    );
  }
  return null;
};
 
export default function Analytics() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Analytics Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track your application performance</p>
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Applications per week</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockBarData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="applications" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Status distribution</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: '12px', color: '#64748b' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}