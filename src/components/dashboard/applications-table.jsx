// components/dashboard/applications-table.js
import Badge from './badge';
import { Eye, Edit } from 'lucide-react';
import { mockApplications } from '@/lib/mockdata';
export default function ApplicationsTable() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md overflow-hidden">
      <div className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-x-1">
          View all <span className="text-lg leading-none">→</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
              <th className="px-8 py-5">COMPANY</th>
              <th className="px-8 py-5">ROLE</th>
              <th className="px-8 py-5">STATUS</th>
              <th className="px-8 py-5">APPLIED</th>
              <th className="px-8 py-5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {mockApplications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                <td className="px-8 py-6 font-medium text-gray-900 dark:text-white">{app.company}</td>
                <td className="px-8 py-6 text-gray-600 dark:text-gray-300">{app.role}</td>
                <td className="px-8 py-6">
                  <Badge variant={app.status}>{app.status}</Badge>
                </td>
                <td className="px-8 py-6 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl">
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 flex items-center justify-between text-xs text-gray-400 border-t">
        <p>Showing 5 of 42 applications</p>
        <div className="flex items-center gap-x-6">
          <button className="hover:text-gray-600">← Previous</button>
          <button className="hover:text-gray-600">Next →</button>
        </div>
      </div>
    </div>
  );
}