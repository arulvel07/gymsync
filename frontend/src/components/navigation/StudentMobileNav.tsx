import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, QrCode } from 'lucide-react';

export const StudentMobileNav: React.FC = () => {
  const items = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Planner', path: '/planner', icon: Calendar },
    { label: 'Check In', path: '/check-in', icon: QrCode },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121215]/95 backdrop-blur-md border-t border-white/10 px-4 py-2 flex items-center justify-around text-xs support-safe-area"
      style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors no-underline min-w-[72px] ${
                isActive
                  ? 'text-blue-400 font-semibold'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-full transition-colors ${
                    isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[0.68rem] tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
