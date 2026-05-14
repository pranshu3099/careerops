import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import SummaryCards from "@/components/dashboard/summary-card";
import ApplicationsTable from "@/components/dashboard/applications-table";
import FollowUps from "@/components/dashboard/follow-ups";
import Analytics from "@/components/dashboard/analytics";
import DueSoonFollowupsAlerts from "@/components/dashboard/due-soon-followups-alerts";
import useCurrentUser from "@/hooks/use-current-user";
import { useApplications } from "@/context/applications-context";
import useUpcomingFollowups from "@/hooks/use-upcoming-follow-up";

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userName } = useCurrentUser();
  const { applications } = useApplications();
  const { followUps, refetchFollowups } = useUpcomingFollowups({
    autoFetch: true,
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onMobileMenuClick={() => setMobileOpen(true)}
          onApplicationCreated={refetchFollowups}
        />

        <main className="flex-1 overflow-auto p-5 md:p-7 space-y-6 md:ml-[72px] lg:ml-60">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Welcome back, {userName}{" "}
            </p>
          </div>

          <SummaryCards />

          <DueSoonFollowupsAlerts onFollowupsChanged={refetchFollowups} />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8">
              <ApplicationsTable
                applications={applications}
                onStatusUpdated={refetchFollowups}
                followUps={followUps}
              />
            </div>
            <div className="xl:col-span-4">
              <FollowUps followUps={followUps} />
            </div>
          </div>

          <Analytics />
        </main>
      </div>
    </div>
  );
}
