// components/layout/sidebar.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, FileText, Bell, BarChart3, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/dashboard', active: true },
  { label: 'Applications', icon: FileText, href: '/applications' },
  { label: 'Follow-ups', icon: Bell, href: '/follow-ups' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <div
        className={`hidden md:block h-screen fixed left-0 top-0 z-40 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Collapse Button */}
          <div className="px-6 py-8 flex items-center justify-between">
            <div className={`flex items-center gap-x-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-75' : 'opacity-100'}`}>
              <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold tracking-tighter">JT</span>
              </div>
              {!isCollapsed && (
                <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  JobTrack
                </span>
              )}
            </div>

            <button
              onClick={toggleCollapse}
              className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-x-3 px-4 py-3.5 rounded-3xl text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                        item.active
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 text-center">
              v24.4 • Pranshu&apos;s Tracker
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeMobile}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl transition-transform">
            <div className="flex flex-col h-full">
              <div className="px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold tracking-tighter">JT</span>
                  </div>
                  <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    JobTrack
                  </span>
                </div>
                <button onClick={closeMobile} className="p-2 text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-3">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={closeMobile}
                          className={`flex items-center gap-x-3 px-4 py-3.5 rounded-3xl text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            item.active
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}