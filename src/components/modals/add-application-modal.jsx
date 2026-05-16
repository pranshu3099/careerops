"use client";

import { useCallback, useState, useEffect } from "react";
import { X, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { createApplication } from "@/lib/applications";
import { getCurrentUserId } from "@/lib/api";
import { useApplications } from "@/context/applications-context";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white text-sm text-slate-800 placeholder:text-slate-300";

export default function AddApplicationModal({ isOpen, onClose, onApplicationCreated }) {
  const { refetchApplications } = useApplications();
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    platform: "LinkedIn",
    hrName: "",
    hrEmail: "",
    appliedDate: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      document.body.style.overflow = "visible";
    }, 250);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        company: "",
        role: "",
        location: "",
        platform: "LinkedIn",
        hrName: "",
        hrEmail: "",
        appliedDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = "Required";
    if (!formData.role.trim()) newErrors.role = "Required";
    if (!formData.location.trim()) newErrors.location = "Required";
    if (!formData.hrName.trim()) newErrors.hrName = "Required";
    if (!formData.hrEmail.trim()) newErrors.hrEmail = "Required";
    if (!formData.appliedDate) newErrors.appliedDate = "Required";
    if (formData.hrEmail && !/\S+@\S+\.\S+/.test(formData.hrEmail)) {
      newErrors.hrEmail = "Enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const userId = getCurrentUserId();
      if (!userId)
        throw new Error("Unable to identify user. Please log in again.");

      await createApplication({
        userId,
        company: formData.company.trim(),
        role: formData.role.trim(),
        platform: formData.platform,
        appliedDate: formData.appliedDate,
        location: formData.location.trim(),
        hrName: formData.hrName.trim(),
        hrEmail: formData.hrEmail.trim(),
      });
      await refetchApplications();
      await onApplicationCreated?.();
      toast.success("Application added successfully");
      handleClose();
    } catch (error) {
      toast.error(error?.message || "Failed to create application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 py-4 backdrop-blur-sm transition-opacity duration-250 sm:items-center sm:p-4 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 transition-all duration-250 ease-out sm:max-h-[calc(100dvh-3rem)] ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 sm:flex">
              <Briefcase className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-800">
                Add New Application
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Track your latest job application
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
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Company */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Company <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Google"
              />
              {errors.company && (
                <p className="text-rose-500 text-xs mt-1">{errors.company}</p>
              )}
            </div>

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
                <p className="text-rose-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {/* Platform */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Naukri">Naukri</option>
                <option value="Referral">Referral</option>
                <option value="Career Page">Career Page</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Applied Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Applied Date <span className="text-rose-400">*</span>
              </label>
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
                <p className="text-rose-500 text-xs mt-1">{errors.hrName}</p>
              )}
            </div>

            {/* HR Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                HR / Recruiter Email <span className="text-rose-400">*</span>
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
                <p className="text-rose-500 text-xs mt-1">{errors.hrEmail}</p>
              )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Notes{" "}
                <span className="text-slate-300 font-normal normal-case">
                  (optional)
                </span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className={`${inputClass} max-h-32 resize-y`}
                placeholder="Any additional notes, referral details, or reminders..."
              />
            </div>
          </div>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:gap-3 sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
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
                "Save Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
