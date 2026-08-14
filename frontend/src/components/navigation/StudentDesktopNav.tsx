import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, QrCode } from 'lucide-react';

export const StudentDesktopNav: React.FC = () => {
  const items = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Planner', path: '/planner', icon: Calendar },
    { label: 'Check In', path: '/check-in', icon: QrCode },
  ];

  return (
    <nav aria-label="Student primary navigation" className="hidden md:flex items-center gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <Icon size={14} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
