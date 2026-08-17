import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  QrCode,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Gym Overview', path: '/admin/overview', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Gym Entrance', path: '/admin/qr', icon: QrCode },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Attendance', path: '/admin/attendance', icon: ClipboardList },
      { label: 'Gym Insights', path: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Gym Configuration', path: '/admin/config', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '' }) => {
  const location = useLocation();

  return (
    <aside
      className={`hidden lg:flex w-60 fixed top-14 left-0 bottom-0 bg-[#121215] border-r border-white/10 p-4 flex-col gap-5 overflow-y-auto z-30 ${className}`}
    >
      <nav aria-label="Admin sidebar navigation" className="flex flex-col gap-6">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#71717a] px-3 py-1">
              {group.title}
            </div>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/admin/overview' && location.pathname === '/admin');

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-blue-400' : 'text-[#71717a]'} aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
