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
} from "recharts";
import { useMemo } from "react";
import Link from "next/link";
import Card from "./card";
import { useApplications } from "@/context/applications-context";

const STATUS_CONFIG = {
  APPLIED: { label: "Applied", color: "#3b82f6" },
  SHORTLISTED: { label: "Shortlisted", color: "#6366f1" },
  INTERVIEWING: { label: "Interviewing", color: "#f59e0b" },
  OFFERED: { label: "Offered", color: "#10b981" },
  ACCEPTED: { label: "Accepted", color: "#059669" },
  OFFER_DECLINED: { label: "Offer Declined", color: "#f97316" },
  REJECTED: { label: "Rejected", color: "#f43f5e" },
  GHOSTED: { label: "Ghosted", color: "#64748b" },
};

const getTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const getWeekStart = (date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
};

const formatWeek = (date) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);

const buildWeeklyData = (applications) => {
  const currentWeekStart = getWeekStart(new Date());

  return Array.from({ length: 6 }, (_, index) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - (5 - index) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const applicationsCount = applications.filter((application) => {
      const appliedAt = getTime(application?.appliedAt);
      return appliedAt >= weekStart.getTime() && appliedAt < weekEnd.getTime();
    }).length;

    return {
      week: formatWeek(weekStart),
      applications: applicationsCount,
    };
  });
};

const buildStatusData = (applications) =>
  Object.entries(
    applications.reduce((counts, application) => {
      const status = String(
        application?.currentStatus || application?.status || "APPLIED",
      ).toUpperCase();
      return {
        ...counts,
        [status]: (counts[status] || 0) + 1,
      };
    }, {}),
  ).map(([status, value]) => ({
    name: STATUS_CONFIG[status]?.label || status,
    value,
    color: STATUS_CONFIG[status]?.color || "#94a3b8",
  }));
 
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
  const { applications, isLoading, error } = useApplications();
  const analyticsApplications = useMemo(
    () => applications || [],
    [applications],
  );
  const weeklyData = useMemo(
    () => buildWeeklyData(analyticsApplications),
    [analyticsApplications],
  );
  const statusData = useMemo(
    () => buildStatusData(analyticsApplications),
    [analyticsApplications],
  );
  const hasApplications = analyticsApplications.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Analytics Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track your application performance</p>
        </div>
        <Link
          href="/dashboard/analytics"
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 hover:border-indigo-100"
        >
          View full analytics
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Applications per week</p>
          <div className="h-64">
            {isLoading ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                Loading analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="applications" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
 
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Status distribution</p>
          <div className="h-64 flex items-center justify-center">
            {isLoading ? (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                Loading analytics...
              </div>
            ) : !hasApplications ? (
              <div className="text-sm text-slate-400">
                No applications to analyze yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: "12px", color: "#64748b" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
