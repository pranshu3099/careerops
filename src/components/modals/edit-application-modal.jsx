import { useState, useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateApplication } from '@/lib/applications';
import { useApplications } from '@/context/applications-context';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white text-sm text-slate-800 placeholder:text-slate-300';

const PLATFORMS = ['LinkedIn', 'Naukri', 'Referral', 'Career Page', 'Other'];


export default function EditApplicationModal({ isOpen, onClose, application }) {
    console.log(application, "application");
  const { refetchApplications } = useApplications();

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    platform: 'LinkedIn',
    hrName: '',
    hrEmail: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Sync animation state with isOpen
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    }
  }, [isOpen]);

  // Populate fields whenever the target application changes
  useEffect(() => {
    if (isOpen && application) {
      setFormData({
        company: application.company ?? '',
        role: application.role ?? '',
        location: application.location ?? '',
        platform: application.platform ?? 'LinkedIn',
        hrName: application.hrName ?? '',
        hrEmail: application.hrEmail ?? '',
        notes: application.notes ?? '',
      });
      setErrors({});
    }
  }, [isOpen, application]);

  // Escape key support
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      document.body.style.overflow = 'visible';
    }, 250);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = 'Required';
    if (!formData.role.trim()) newErrors.role = 'Required';
    if (!formData.location.trim()) newErrors.location = 'Required';
    if (!formData.hrName.trim()) newErrors.hrName = 'Required';
    if (!formData.hrEmail.trim()) newErrors.hrEmail = 'Required';
    if (formData.hrEmail && !/\S+@\S+\.\S+/.test(formData.hrEmail)) {
      newErrors.hrEmail = 'Enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await updateApplication(application.id, {
        company: formData.company.trim(),
        role: formData.role.trim(),
        location: formData.location.trim(),
        platform: formData.platform,
        hrName: formData.hrName.trim(),
        hrEmail: formData.hrEmail.trim(),
        notes: formData.notes.trim(),
      });
      await refetchApplications();
      toast.success('Application updated successfully');
      handleClose();
    } catch (error) {
      toast.error(error?.message || 'Failed to update application');
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-250 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white w-full max-w-xl rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden transition-all duration-250 ease-out ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Briefcase className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Edit Application</h2>
              <p className="text-xs text-slate-400 mt-0.5">Update your application details</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-4.5 h-4.5 text-slate-400" />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
              {errors.company && <p className="text-rose-500 text-xs mt-1">{errors.company}</p>}
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
              {errors.role && <p className="text-rose-500 text-xs mt-1">{errors.role}</p>}
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
              {errors.location && <p className="text-rose-500 text-xs mt-1">{errors.location}</p>}
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
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
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
              {errors.hrName && <p className="text-rose-500 text-xs mt-1">{errors.hrName}</p>}
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
              {errors.hrEmail && <p className="text-rose-500 text-xs mt-1">{errors.hrEmail}</p>}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Notes{' '}
                <span className="text-slate-300 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className={`${inputClass} resize-y`}
                placeholder="Any additional notes, referral details, or reminders..."
              />
            </div>
          </div>

          {/* ── Actions ── */}
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}