import FollowupsWorkspace from "@/components/dashboard/followups-workspace";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";

export default function FollowupsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleApplicationCreated = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          onMobileMenuClick={() => setMobileOpen(true)}
          onApplicationCreated={handleApplicationCreated}
        />

        <main className="flex-1 space-y-6 overflow-auto p-5 md:ml-[72px] md:p-7 lg:ml-60">
          <FollowupsWorkspace refreshKey={refreshKey} />
        </main>
      </div>
    </div>
  );
}
