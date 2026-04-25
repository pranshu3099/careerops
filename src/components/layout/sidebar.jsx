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
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-slate-100 bg-white transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className={`px-4 py-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200">
                <span className="text-white text-sm font-bold">JT</span>
              </div>
              <span className="text-base font-bold tracking-tight text-slate-800">JobTrack</span>
            </div>
          )}
 
          {isCollapsed && (
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-200">
              <span className="text-white text-sm font-bold">JT</span>
            </div>
          )}
 
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
 
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="mx-auto mb-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
 
        {/* Nav */}
        <nav className="flex-1 px-3 mt-2">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu</p>
          )}
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      item.active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${item.active ? 'text-indigo-600' : ''}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {!isCollapsed && item.active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
 
        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                P
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">Pranshu S.</p>
                <p className="text-[10px] text-slate-400">Free plan</p>
              </div>
            </div>
          </div>
        )}
      </div>
 
      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMobile} />
          <div className="absolute left-0 top-0 h-full w-60 bg-white shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="px-4 py-5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm font-bold">JT</span>
                  </div>
                  <span className="text-base font-bold text-slate-800">JobTrack</span>
                </div>
                <button onClick={closeMobile} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
 
              <nav className="flex-1 px-3 mt-4">
                <ul className="space-y-0.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={closeMobile}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            item.active
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-4.5 h-4.5" />
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