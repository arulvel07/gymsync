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
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Close drawer when location changes
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Focus management & keyboard focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus first focusable element (close button or link)
    const timer = setTimeout(() => {
      if (drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !drawerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !drawerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
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
        className="relative z-10 w-4/5 max-w-xs bg-[#121215] border-r border-white/10 h-full flex flex-col justify-between p-5 overflow-y-auto animate-fade-in-up focus:outline-none"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <Brand variant="admin" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#71717a] hover:text-white hover:bg-white/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Admin mobile navigation" className="flex flex-col gap-5">
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
                        className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium transition-colors no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
        </div>

        <div className="border-t border-white/10 pt-4 text-xs text-[#71717a]">
          GymSync Operational Shell
        </div>
      </div>
    </div>
  );
};
