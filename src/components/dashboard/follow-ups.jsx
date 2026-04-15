// components/dashboard/follow-ups.js
import Card from './card';
import { CalendarClock } from 'lucide-react';
import { mockFollowUps } from '@/lib/mockdata';
export default function FollowUps() {
  return (
    <Card className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <CalendarClock className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Follow-ups</h2>
        </div>
        <span className="text-xs bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 px-3 py-1 rounded-2xl">
          {mockFollowUps.length}
        </span>
      </div>

      <div className="flex-1 px-6 space-y-4 overflow-auto">
        {mockFollowUps.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl p-4 transition-all hover:-translate-y-px ${
              item.urgent
                ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800'
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}
          >
            <div className="flex justify-between">
              <div className="font-medium text-gray-900 dark:text-white">{item.company}</div>
              {item.urgent && (
                <div className="text-[10px] font-bold uppercase tracking-widest bg-orange-500 text-white px-2.5 rounded-2xl h-5 flex items-center">
                  Urgent
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{item.message}</p>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-x-1">
              📅 {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}