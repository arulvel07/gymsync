import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogIn } from 'lucide-react';
import { Brand } from './Brand';
import { GymStatusIndicator } from './GymStatusIndicator';
import { UserMenu } from './UserMenu';
import { StudentDesktopNav } from './StudentDesktopNav';

interface AppHeaderProps {
  variant?: 'student' | 'admin' | 'public';
  onMobileMenuToggle?: () => void;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  variant = 'student',
  onMobileMenuToggle,
  className = '',
}) => {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-14 px-4 sm:px-6 flex items-center justify-between bg-[#09090b]/90 backdrop-blur-md border-b border-white/10 transition-colors ${className}`}
    >
      {/* Left side: Brand + Mobile Menu Button + Desktop Nav */}
      <div className="flex items-center gap-4 sm:gap-6">
        {variant === 'admin' && onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="Open navigation drawer"
            className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        )}

        <Brand variant={variant} />

        {variant === 'student' && <StudentDesktopNav />}
      </div>

      {/* Right side: Gym Status Indicator + User Menu / Login */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        <GymStatusIndicator />

        {variant === 'public' ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="bg-blue-600 text-[#fafafa] text-xs font-semibold px-3 py-1.5 sm:px-3.5 rounded-lg border border-white/15 hover:bg-blue-500 transition-all no-underline inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
            >
              <LogIn size={14} aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          </div>
        ) : (
          <UserMenu />
        )}
      </div>
    </header>
  );
};
