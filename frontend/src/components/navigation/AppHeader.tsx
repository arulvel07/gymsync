import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
            aria-label="Toggle navigation drawer"
            className="lg:hidden p-1.5 rounded-md text-[#a1a1aa] hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}

        <Brand variant={variant} />

        {variant === 'student' && <StudentDesktopNav />}
      </div>

      {/* Right side: Gym Status Indicator + User Menu / Login */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hide Gym Status on small mobile screens if space is tight */}
        <GymStatusIndicator className="hidden xs:inline-flex" />

        {variant === 'public' ? (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="bg-blue-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md border border-white/15 hover:bg-blue-500 transition-all no-underline"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <UserMenu />
        )}
      </div>
    </header>
  );
};
