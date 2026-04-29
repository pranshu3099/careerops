import { useState } from "react";
import Badge from "./badge";
import { Eye, Edit } from "lucide-react";
import EditApplicationModal from "../modals/edit-application-modal";
import StatusTransitionMenu from "./statustransition";
export default function ApplicationsTable({ applications, onStatusUpdated }) {
  const [editTarget, setEditTarget] = useState(null);
  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Recent Applications
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your latest job applications
            </p>
          </div>
          <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
            View all <span>→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100 text-left">
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Company
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Applied
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications?.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                        {app.company[0]}
                      </div>
                      <span className="font-medium text-slate-800 text-sm">
                        {app.company}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {app.role}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={app.currentStatus}>
                      {app.currentStatus}
                    </Badge>
                      <StatusTransitionMenu
                        application={app}
                        onStatusUpdated={onStatusUpdated}
                      />

                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(app.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                      {app.currentStatus !== "OFFERED" && <button
                        onClick={() => setEditTarget(app)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 flex items-center justify-between border-t border-slate-50 bg-slate-50/50">
          <p className="text-xs text-slate-400">Showing 5 of 42 applications</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-colors">
              ← Prev
            </button>
            <button className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>

      <EditApplicationModal
        isOpen={!!editTarget}
        application={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </>
  );
}
