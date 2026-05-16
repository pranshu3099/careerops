import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import useCurrentUser from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth";
import { LogOut, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userName, userEmail, isLoading } = useCurrentUser();
  const router = useRouter();
  const displayName = userName || "User";
  const displayEmail = userEmail || "Email not available";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const logoutUser = async () => {
    try {
      setIsLoggingOut(true);
      const response = await handleLogout();

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 space-y-6 overflow-auto p-5 md:ml-[72px] md:p-7 lg:ml-60">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Profile
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Manage your account information
            </p>
          </div>

          <section className="max-w-3xl rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-base font-bold text-white shadow-sm shadow-indigo-100">
                {isLoading ? "" : initials || "U"}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-800">
                  {isLoading ? "Loading..." : displayName}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-400">
                  {isLoading ? "Loading account details" : displayEmail}
                </p>
              </div>
            </div>

            <div className="space-y-6 px-5 py-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Personal info
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <User className="h-3.5 w-3.5" />
                      Name
                    </div>
                    <p className="mt-2 truncate text-sm font-medium text-slate-700">
                      {isLoading ? "Loading..." : displayName}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </div>
                    <p className="mt-2 truncate text-sm font-medium text-slate-700">
                      {isLoading ? "Loading..." : displayEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold text-slate-800">
                  Account
                </h3>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={logoutUser}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
