import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { ADMIN_NAV_GROUPS } from './AdminSidebar';
import { Brand } from './Brand';

interface AdminMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer when location changes
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Keyboard escape & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Admin Navigation Drawer"
        className="relative z-10 w-4/5 max-w-xs bg-[#121215] border-r border-white/10 h-full flex flex-col justify-between p-5 overflow-y-auto animate-fade-in-up"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <Brand variant="admin" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-1 rounded-md text-[#71717a] hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-1.5">
                <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#71717a] px-2">
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors no-underline ${
                          isActive
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                            : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-blue-400' : 'text-[#71717a]'} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-xs text-[#71717a]">
          GymSync Operational Shell
        </div>
      </div>
    </div>
  );
};
