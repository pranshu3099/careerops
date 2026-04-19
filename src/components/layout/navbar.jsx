// components/layout/navbar.js
"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { handleLogout } from "@/lib/auth";
import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import AddApplicationModal from "../modals/add-application-modal";
export default function Navbar({ onMobileMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();
  async function logoutUser() {
    const res = await handleLogout();
    if (res.ok) {
      router.push("/");
      toast.success("logged out successfully");
    }
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 md:px-8 py-5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-x-4">
          <button
            onClick={onMobileMenuClick}
            className="md:hidden p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white md:hidden">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-x-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-medium text-sm transition-all active:scale-95"
          >
            <span className="text-lg">+</span>
            Add Application
          </button>
          <button className="relative p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700">
            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              3
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-3xl pr-2 pl-1 py-1"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                P
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Pranshu Srivastava
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @pranshukodes
                </p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 text-sm z-50">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-semibold">Pranshu Srivastava</p>
                  <p className="text-gray-500 text-xs">
                    pranshukodes@gmail.com
                  </p>
                </div>
                <a
                  href="#"
                  className="flex px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-x-3"
                >
                  👤 Profile
                </a>
                <a
                  href="#"
                  className="flex px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-x-3"
                >
                  ⚙️ Settings
                </a>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                <button
                  onClick={logoutUser}
                  className="flex w-full px-5 py-3 text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 items-center gap-x-3 font-medium"
                >
                  ← Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
