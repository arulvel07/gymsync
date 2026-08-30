import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Activity, Calendar, User } from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';

export const StudentMobileNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const isHomeActive = location.pathname === '/dashboard' && !location.hash;
  const isActivityActive = location.pathname === '/dashboard' && location.hash === '#activity';
  const isPlanActive = location.pathname === '/planner';

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Remove hash if present
      if (location.hash) {
        navigate('/dashboard', { replace: true });
      }
    } else {
      navigate('/dashboard');
    }
  };

  const handleActivityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/dashboard') {
      const el = document.getElementById('activity');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', '#activity');
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    } else {
      navigate('/dashboard#activity');
    }
  };

  return (
    <>
      <nav
        aria-label="Student mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121215]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex items-center justify-around text-xs support-safe-area shadow-2xl"
        style={{ paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Item 1: Home */}
        <button
          type="button"
          onClick={handleHomeClick}
          aria-current={isHomeActive ? 'page' : undefined}
          aria-label="Home Dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer min-w-[64px] min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isHomeActive
              ? 'text-blue-400 font-semibold'
              : 'text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              isHomeActive ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent'
            }`}
            aria-hidden="true"
          >
            <Home size={18} aria-hidden="true" />
          </div>
          <span className="text-[0.68rem] tracking-tight">Home</span>
        </button>

        {/* Item 2: Activity */}
        <button
          type="button"
          onClick={handleActivityClick}
          aria-current={isActivityActive ? 'page' : undefined}
          aria-label="Personal Activity Log"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer min-w-[64px] min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isActivityActive
              ? 'text-blue-400 font-semibold'
              : 'text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              isActivityActive ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent'
            }`}
            aria-hidden="true"
          >
            <Activity size={18} aria-hidden="true" />
          </div>
          <span className="text-[0.68rem] tracking-tight">Activity</span>
        </button>

        {/* Item 3: Plan */}
        <NavLink
          to="/planner"
          aria-label="Workout Planner"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all no-underline min-w-[64px] min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isActive
                ? 'text-blue-400 font-semibold'
                : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent'
                }`}
                aria-hidden="true"
              >
                <Calendar size={18} aria-hidden="true" />
              </div>
              <span className="text-[0.68rem] tracking-tight">Plan</span>
            </>
          )}
        </NavLink>

        {/* Item 4: Profile */}
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          aria-label="User Profile & Settings"
          aria-haspopup="dialog"
          aria-expanded={profileOpen}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer min-w-[64px] min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            profileOpen
              ? 'text-blue-400 font-semibold'
              : 'text-[#71717a] hover:text-[#a1a1aa]'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              profileOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent'
            }`}
            aria-hidden="true"
          >
            <User size={18} aria-hidden="true" />
          </div>
          <span className="text-[0.68rem] tracking-tight">Profile</span>
        </button>
      </nav>

      {/* Mobile User Profile Bottom Sheet / Modal */}
      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
};

