import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';
import SummaryCards from '@/components/dashboard/summary-card';
import ApplicationsTable from '@/components/dashboard/applications-table';
import FollowUps from '@/components/dashboard/follow-ups';
import Analytics from '@/components/dashboard/analytics';

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - Pushed right when sidebar is open */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        // When sidebar is collapsed on desktop, reduce left margin
        // But since sidebar is fixed, we use ml-20 or ml-64
        ''
      }`}>
        <Navbar onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-auto p-4 md:p-8 space-y-8 md:ml-20 lg:ml-64">
          <SummaryCards />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8">
              <ApplicationsTable />
            </div>
            <div className="xl:col-span-4">
              <FollowUps />
            </div>
          </div>

          <Analytics />
        </main>
      </div>
    </div>
  );
}