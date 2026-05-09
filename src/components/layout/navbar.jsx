import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { handleLogout } from "@/lib/auth";
import { Bell, Loader2, LogOut, Menu, Settings, User } from "lucide-react";
import { useState } from "react";
import useCurrentUser from "@/hooks/use-current-user";
import AddApplicationModal from "../modals/add-application-modal";
import Link from "next/link";

export default function Navbar({ onMobileMenuClick, onApplicationCreated }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userName, userEmail } = useCurrentUser();
  const router = useRouter();
 
  async function logoutUser() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      const res = await handleLogout();

      if (res.ok) {
        router.push("/");
        toast.success("Logged out successfully");
        return;
      }

      toast.error("Failed to logout");
    } catch (error) {
      toast.error(error?.message || "Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </div>
 
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all active:scale-95 shadow-sm shadow-indigo-200"
          >
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>
 
          {/* <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
              3
            </span>
          </button> */}
 
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 hover:bg-slate-50 rounded-xl pr-2 pl-1 py-1 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {userName[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{userName}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{userEmail}</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
 
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 text-sm z-50">
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="font-semibold text-slate-800">{userName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{userEmail}</p>
                </div>
                <Link href="/dashboard/profile" className="flex px-4 py-2.5 hover:bg-slate-50 items-center gap-2.5 text-slate-600 transition-colors">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link href="/dashboard/settings" className="flex px-4 py-2.5 hover:bg-slate-50 items-center gap-2.5 text-slate-600 transition-colors">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <div className="border-t border-slate-50 my-1" />
                <button
                  onClick={logoutUser}
                  disabled={isLoggingOut}
                  className="flex w-full px-4 py-2.5 text-rose-500 hover:bg-rose-50 items-center gap-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
 
      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onApplicationCreated={onApplicationCreated}
      />
    </>
  );
}
