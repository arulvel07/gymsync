import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Shield, User, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const { profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User Account Menu"
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-semibold text-[#fafafa] leading-tight max-w-[120px] truncate">
            {profile?.full_name || profile?.roll_number || 'Student'}
          </div>
          <div className="text-[0.68rem] text-[#a1a1aa] capitalize">
            {profile?.role || 'student'}
          </div>
        </div>
        <ChevronDown size={14} className={`text-[#71717a] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-[#1f1f24] border border-white/10 rounded-md shadow-2xl py-1 z-50 text-xs animate-fade-in-up"
        >
          {/* Header info inside dropdown */}
          <div className="px-3.5 py-2.5 border-b border-white/10">
            <div className="font-semibold text-white truncate">{profile?.full_name || 'User Profile'}</div>
            <div className="text-[0.72rem] font-mono text-[#a1a1aa] mt-0.5">{profile?.roll_number || 'IIITDM Member'}</div>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
              Role: {profile?.role || 'student'}
            </div>
          </div>

          {/* Role switcher link if user is admin */}
          {profile?.role === 'admin' && (
            <div className="py-1 border-b border-white/10">
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-blue-400 hover:bg-blue-500/10 transition-colors font-medium no-underline"
                role="menuitem"
              >
                <Shield size={14} />
                <span>Admin Command Center</span>
              </Link>
            </div>
          )}

          {/* Logout Action */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer border-0 bg-transparent"
              role="menuitem"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
