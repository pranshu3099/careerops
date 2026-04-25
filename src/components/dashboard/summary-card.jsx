import Card from './card';
import { Briefcase, Calendar, Award, XCircle } from 'lucide-react';
import { mockSummary } from '@/lib/mockdata';
 
const cards = [
  {
    title: 'Total Applications',
    value: mockSummary.totalApplications,
    icon: Briefcase,
    accent: 'bg-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    gradient: 'from-blue-50 to-white',
  },
  {
    title: 'Interviews Scheduled',
    value: mockSummary.interviewsScheduled,
    icon: Calendar,
    accent: 'bg-amber-400',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    gradient: 'from-amber-50 to-white',
  },
  {
    title: 'Offers Received',
    value: mockSummary.offersReceived,
    icon: Award,
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    gradient: 'from-emerald-50 to-white',
  },
  {
    title: 'Rejections',
    value: mockSummary.rejections,
    icon: XCircle,
    accent: 'bg-rose-400',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-400',
    gradient: 'from-rose-50 to-white',
  },
];
 
export default function SummaryCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-5 flex flex-col gap-4 overflow-hidden relative">
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${card.accent}`} />
 
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
 
            <div>
              <p className="text-3xl font-bold text-slate-800 tracking-tight">{card.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{card.title}</p>
            </div>
 
            <div className="flex items-center text-xs text-emerald-600 font-medium gap-1">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-50 text-emerald-500 text-[10px]">↑</span>
              12% from last month
            </div>
          </Card>
        );
      })}
    </div>
  );
}