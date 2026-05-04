import ApplicationDetailsModal from "@/components/modals/application-details-modal";

export default function DueSoonFollowupModal({
  isOpen,
  followup,
  mode,
  onClose,
  onStatusUpdated,
}) {
  const application = followup
    ? {
        id: followup.applicationId,
        company: followup.company,
        role: followup.role,
        location: followup.location,
        status: followup.status,
        appliedAt: followup.appliedAt,
        scheduledAt: followup.scheduledAt,
        followupMessage: followup.message || followup.alert?.message,
      }
    : null;

  return (
    <ApplicationDetailsModal
      isOpen={isOpen}
      application={application}
      mode={mode}
      onClose={onClose}
      onStatusUpdated={onStatusUpdated}
    />
  );
}
