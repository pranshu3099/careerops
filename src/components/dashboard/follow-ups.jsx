import { useState } from "react";
import Card from "./card";
import { CalendarClock } from "lucide-react";
import FollowUpModal from "../modals/followup-modal";

export default function FollowUps({ followUps }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50">
              <CalendarClock className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              Upcoming Follow-ups
            </h2>
          </div>
          <span className="text-xs font-semibold bg-amber-50 text-amber-500 px-2.5 py-1 rounded-full ring-1 ring-amber-100">
            {followUps?.length} due
          </span>
        </div>

        <div className="flex-1 px-4 py-4 space-y-3 overflow-auto">
          {followUps.map((app) => (
            <div
              key={app?.applicationId}
              onClick={() => setSelected(app)}
              className="rounded-xl p-4 transition-all hover:-translate-y-px cursor-pointer bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-slate-800 text-sm">
                  {app?.company} · {app?.role}
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                {app?.message}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <CalendarClock className="w-3 h-3" />
                {new Date(app?.scheduledAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selected && (
        <FollowUpModal app={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
