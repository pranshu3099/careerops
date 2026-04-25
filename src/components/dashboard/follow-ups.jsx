import Card from './card';
import { CalendarClock } from 'lucide-react';
import { mockFollowUps } from '@/lib/mockdata';
 
export default function FollowUps() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50">
            <CalendarClock className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Upcoming Follow-ups</h2>
        </div>
        <span className="text-xs font-semibold bg-amber-50 text-amber-500 px-2.5 py-1 rounded-full ring-1 ring-amber-100">
          {mockFollowUps.length} due
        </span>
      </div>
 
      <div className="flex-1 px-4 py-4 space-y-3 overflow-auto">
        {mockFollowUps.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl p-4 transition-all hover:-translate-y-px cursor-pointer ${
              item.urgent
                ? 'bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100'
                : 'bg-slate-50 border border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-slate-800 text-sm">{item.company}</div>
              {item.urgent && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                  Urgent
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">{item.message}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">📅</span>
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}