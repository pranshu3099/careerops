"use client";

import { useCallback, useState, useEffect } from "react";
import { X, Briefcase, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import { updateApplication } from "@/lib/applications";
import RescheduleAlert from "./reschedule-followup-modal";
import { useApplications } from "@/context/applications-context";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white text-sm text-slate-800 placeholder:text-slate-300";

const inputDisabledClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed outline-none";

const PLATFORMS = [
  { label: "LinkedIn", value: "LINKEDIN" },
  { label: "Naukri", value: "NAUKRI" },
  { label: "Referral", value: "REFERRAL" },
  { label: "Career Page", value: "CAREER_PAGE" },
  { label: "Other", value: "OTHER" },
];

const normalizeText = (value) => String(value ?? "").trim();

const normalizeDate = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const normalizeSource = (value) =>
  String(value || "LINKEDIN")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

const getChangedApplicationFields = (
  application,
  formData,
  canUpdateAppliedDate,
) => {
  const nextValues = {
    role: normalizeText(formData.role),
    location: normalizeText(formData.location),
    source: formData.source,
    hrName: normalizeText(formData.hrName),
    hrEmail: normalizeText(formData.hrEmail),
    ...(canUpdateAppliedDate && { appliedDate: formData.appliedDate }),
  };

  const currentValues = {
    role: normalizeText(application?.role),
    location: normalizeText(application?.location),
    source: normalizeSource(application?.source),
    hrName: normalizeText(application?.hrName),
    hrEmail: normalizeText(application?.hrEmail),
    ...(canUpdateAppliedDate && {
      appliedDate: normalizeDate(application?.appliedAt),
    }),
  };

  return Object.entries(nextValues).reduce((payload, [field, value]) => {
    if (value !== currentValues[field]) {
      payload[field] = value;
    }
    return payload;
  }, {});
};

export default function EditApplicationModal({
  isOpen,
  onClose,
  application,
  onApplicationUpdated,
}) {
  const [formData, setFormData] = useState({
    role: "",
    location: "",
    source: "LINKEDIN",
    hrName: "",
    hrEmail: "",
    appliedDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [rescheduleCount, setRescheduleCount] = useState(0);
  const [rescheduleAlert, setRescheduleAlert] = useState(null);
  const {refetchApplications} = useApplications();
  const isAppliedStatus = application?.currentStatus === "APPLIED";

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      document.body.style.overflow = "visible";
    }, 250);
  }, [onClose]);

  const handleRescheduleAlertClose = useCallback(() => {
    setRescheduleCount(0);
    setRescheduleAlert(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && application) {
      setFormData({
        role: application.role ?? "",
        location: application.location ?? "",
        source: normalizeSource(application.source),
        hrName: application.hrName ?? "",
        hrEmail: application.hrEmail ?? "",
        appliedDate: application.appliedAt
          ? new Date(application.appliedAt).toISOString().split("T")[0]
          : "",
      });
      setErrors({});
      setRescheduleCount(0);
      setRescheduleAlert(null);
    }
  }, [isOpen, application]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.role.trim()) newErrors.role = "Required";
    if (!formData.location.trim()) newErrors.location = "Required";
    if (!formData.hrName.trim()) newErrors.hrName = "Required";
    if (!formData.hrEmail.trim()) newErrors.hrEmail = "Required";
    if (formData.hrEmail && !/\S+@\S+\.\S+/.test(formData.hrEmail)) {
      newErrors.hrEmail = "Enter a valid email";
    }
    if (isAppliedStatus && !formData.appliedDate) {
      newErrors.appliedDate = "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedFields = getChangedApplicationFields(
      application,
      formData,
      isAppliedStatus,
    );

    if (Object.keys(updatedFields).length === 0) return;

    try {
      setIsSubmitting(true);
      const result = await updateApplication(application.id, updatedFields);

      const nextRescheduleCount = Number(result?.rescheduledFollowUps || 0);
      if (nextRescheduleCount > 0) {
        setRescheduleCount(nextRescheduleCount);

        setRescheduleAlert({
          company: result?.company,
          role: result?.role,
          oldDate: result?.scheduleChanges?.[0]?.oldScheduledAt,
          newDate: result?.scheduleChanges?.[0]?.newScheduledAt,
        });
      }
      await onApplicationUpdated?.(); // will give the latest followups
      await refetchApplications();
      toast.success("Application updated successfully");
      handleClose();
    } catch (error) {
      toast.error(error?.message || "Failed to update application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const shouldShowRescheduleAlert =
    rescheduleCount > 0 && Boolean(rescheduleAlert);

  if (!isOpen && !shouldShowRescheduleAlert) return null;

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-250 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleBackdropClick}
        >
          <div
            className={`bg-white w-full max-w-xl rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden transition-all duration-250 ease-out ${
              isVisible
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Briefcase className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Edit Application
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your application details
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4.5 h-4.5 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 max-h-[75vh] overflow-y-auto"
            >
              {/* Caution alert */}
              <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-100">
                <TriangleAlert className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Applied date can only be updated when the status of
                  application is <span className="font-semibold">Applied</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Role <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Software Engineer"
                  />
                  {errors.role && (
                    <p className="text-rose-500 text-xs mt-1">{errors.role}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Location <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Bangalore, Remote"
                  />
                  {errors.location && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Platform
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Applied Date */}
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                      isAppliedStatus ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    Applied Date
                    {isAppliedStatus && (
                      <span className="text-rose-400"> *</span>
                    )}
                  </label>
                  {isAppliedStatus ? (
                    <>
                      <input
                        type="date"
                        name="appliedDate"
                        value={formData.appliedDate}
                        onChange={handleChange}
                        className={inputClass}
                      />
                      {errors.appliedDate && (
                        <p className="text-rose-500 text-xs mt-1">
                          {errors.appliedDate}
                        </p>
                      )}
                    </>
                  ) : (
                    <input
                      type="date"
                      disabled
                      value={formData.appliedDate}
                      className={inputDisabledClass}
                    />
                  )}
                </div>

                {/* HR Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    HR / Recruiter Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="hrName"
                    value={formData.hrName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Priya Sharma"
                  />
                  {errors.hrName && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.hrName}
                    </p>
                  )}
                </div>

                {/* HR Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    HR / Recruiter Email{" "}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="hrEmail"
                    value={formData.hrEmail}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="hr@company.com"
                  />
                  {errors.hrEmail && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.hrEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 text-sm text-slate-600 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RescheduleAlert
        isOpen={shouldShowRescheduleAlert}
        onClose={handleRescheduleAlertClose}
        company={rescheduleAlert?.company}
        role={rescheduleAlert?.role}
        oldDate={rescheduleAlert?.oldDate}
        newDate={rescheduleAlert?.newDate}
      />
    </>
  );
}
