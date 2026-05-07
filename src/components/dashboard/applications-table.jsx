import { useState, useEffect } from "react";
import Badge from "./badge";
import { Eye, Edit, Trash } from "lucide-react";
import EditApplicationModal from "../modals/edit-application-modal";
import StatusTransitionMenu from "./statustransition";
import { deleteApplication } from "@/lib/applications";
import toast from "react-hot-toast";
import CancelledFollowupsModal from "../modals/cancelled-followups-modal";
import DeleteApplicationModal from "../modals/delete-application-modal";
import ApplicationDetailsModal from "../modals/application-details-modal";
import InterviewActions from "./interview-actions";
import { useApplications } from "@/context/applications-context";
import Link from "next/link";
import { isTerminalApplicationStatus } from "@/lib/application-statuses";

const PAGE_SIZE = 10;

export default function ApplicationsTable({
  applications,
  onStatusUpdated,
  followUps,
}) {
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [cancelledFollowupsAlert, setCancelledFollowupsAlert] = useState(null);
  const { applications: contextApplications, refetchApplications } =
    useApplications();
  const [currentPage, setCurrentPage] = useState(1);
  const nonEditableApplicationStatuses = [
    "OFFERED",
    "ACCEPTED",
    "OFFER_DECLINED",
    "REJECTED",
    "GHOSTED",
  ];
  const tableApplications = contextApplications || [];
  const totalApplications = tableApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalApplications / PAGE_SIZE));
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedApplications = tableApplications.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  );
  const showingApplications = paginatedApplications.length;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleStatusUpdated = async (app, statusChange) => {
    await onStatusUpdated?.(statusChange);
  };

  const handleDeleteApplication = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      const result = await deleteApplication(deleteTarget.id);

      if (result?.success) {
        toast.success("Application deleted successfully");
        setCancelledFollowupsAlert({
          company: result?.company || deleteTarget.company,
          role: result?.role || deleteTarget.role,
        });
        setDeleteTarget(null);
        await refetchApplications();
        await onStatusUpdated?.();
      }
    } catch (error) {
      toast.error(error?.message || "Failed to delete application");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Recent Applications
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your latest job applications
            </p>
          </div>
          <Link
            href="/dashboard/application"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            View all <span>→</span>
          </Link>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
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
              {paginatedApplications.map((app) => {
                const status = app.currentStatus || app.status;
                const isTerminalStatus = isTerminalApplicationStatus(status);

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                  <td className="px-6 py-4 overflow-visible">
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
                    <Badge variant={status}>
                      {status}
                    </Badge>
                    {status !== "INTERVIEWING" && !isTerminalStatus && (
                      <StatusTransitionMenu
                        application={{ ...app, currentStatus: status }}
                        onStatusUpdated={(statusChange) =>
                          handleStatusUpdated(app, statusChange)
                        }
                      />
                    )}
                    {!isTerminalStatus && (
                      <InterviewActions
                        application={app}
                        onChanged={onStatusUpdated}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(app.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewTarget(app)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                      {!nonEditableApplicationStatuses.includes(status) && (
                        <button
                          onClick={() => setEditTarget(app)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                        </button>
                      )}
                      <button
                        disabled={deletingId === app.id}
                        onClick={() => setDeleteTarget(app)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                      </button>
                    </div>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 flex items-center justify-between border-t border-slate-50 bg-slate-50/50">
          <p className="text-xs text-slate-400">
            Showing {showingApplications} of {totalApplications} applications
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <EditApplicationModal
        isOpen={!!editTarget}
        application={editTarget}
        onClose={() => setEditTarget(null)}
        onApplicationUpdated={onStatusUpdated}
        followUps={followUps}
      />

      <ApplicationDetailsModal
        isOpen={Boolean(viewTarget)}
        application={
          viewTarget
            ? {
                id: viewTarget.id,
                company: viewTarget.company,
                role: viewTarget.role,
                location: viewTarget.location,
                status: viewTarget.currentStatus,
                appliedAt: viewTarget.appliedAt,
              }
            : null
        }
        mode="view"
        onClose={() => {
          setViewTarget(null);
        }}
        onStatusUpdated={onStatusUpdated}
      />

      <CancelledFollowupsModal
        isOpen={Boolean(cancelledFollowupsAlert)}
        onClose={() => setCancelledFollowupsAlert(null)}
        company={cancelledFollowupsAlert?.company}
        role={cancelledFollowupsAlert?.role}
      />

      <DeleteApplicationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteApplication}
        application={deleteTarget}
        isDeleting={Boolean(deletingId)}
      />
    </>
  );
}
