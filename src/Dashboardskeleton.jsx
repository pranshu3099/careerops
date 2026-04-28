export default function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 border-r border-slate-100 bg-white px-3 py-5 gap-2">
        <div className="flex items-center gap-2.5 px-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-2.5 w-10 rounded bg-slate-100 animate-pulse mx-2 mb-1" />
        {[120, 100, 80, 110, 90].map((w, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-4 h-4 rounded bg-slate-200 animate-pulse flex-shrink-0" />
            <div className={`h-3 rounded bg-slate-200 animate-pulse`} style={{ width: w }} />
          </div>
        ))}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-20 rounded bg-slate-200 animate-pulse" />
            <div className="h-2 w-14 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-60">
        {/* Navbar */}
        <div className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
          <div className="h-8 w-52 rounded-xl bg-slate-200 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-28 rounded-xl bg-slate-200 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-24 rounded-xl bg-slate-200 animate-pulse" />
          </div>
        </div>

        <main className="flex-1 p-6 space-y-5 overflow-hidden">
          {/* Page title */}
          <div className="space-y-1.5">
            <div className="h-5 w-28 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-44 rounded bg-slate-100 animate-pulse" />
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-200 animate-pulse rounded-none" />
                <div className="w-8 h-8 rounded-xl bg-slate-200 animate-pulse" />
                <div className="h-6 w-10 rounded bg-slate-200 animate-pulse" />
                <div className="h-2.5 w-24 rounded bg-slate-100 animate-pulse" />
                <div className="h-2.5 w-28 rounded-full bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table + follow-ups */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 bg-white border border-slate-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 flex justify-between items-center border-b border-slate-50">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-slate-200 animate-pulse" />
                  <div className="h-2.5 w-44 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
              </div>
              <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100">
                {[60, 40, 48, 44].map((w, i) => (
                  <div key={i} className="h-2.5 rounded bg-slate-200 animate-pulse" style={{ width: w }} />
                ))}
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 px-5 py-3.5 border-b border-slate-50 items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse flex-shrink-0" />
                    <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                  </div>
                  <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="col-span-4 bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                </div>
                <div className="h-5 w-12 rounded-full bg-slate-200 animate-pulse" />
              </div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                  <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                  <div className="h-2.5 w-full rounded bg-slate-200 animate-pulse" />
                  <div className="h-2.5 w-3/4 rounded bg-slate-200 animate-pulse" />
                  <div className="h-2.5 w-14 rounded-full bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}