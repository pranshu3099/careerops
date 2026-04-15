// components/dashboard/summary-cards.js
import Card from './card';
import { Briefcase, Calendar, Award, XCircle } from 'lucide-react';
import { mockSummary } from '@/lib/mockdata';

const cards = [
  { title: 'Total Applications', value: mockSummary.totalApplications, icon: Briefcase, color: 'text-blue-600' },
  { title: 'Interviews Scheduled', value: mockSummary.interviewsScheduled, icon: Calendar, color: 'text-amber-600' },
  { title: 'Offers Received', value: mockSummary.offersReceived, icon: Award, color: 'text-emerald-600' },
  { title: 'Rejections', value: mockSummary.rejections, icon: XCircle, color: 'text-red-600' },
];

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-4xl font-semibold text-gray-900 dark:text-white mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 ${card.color}`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
            <div className="mt-8 flex items-center text-xs text-emerald-600 font-medium">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1" />
              +12% from last month
            </div>
          </Card>
        );
      })}
    </div>
  );
}