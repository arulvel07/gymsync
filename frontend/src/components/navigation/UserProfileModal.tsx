import React from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import {
  User,
  Shield,
  LogOut,
  Calendar,
  Activity,
  Mail,
  CreditCard,
  Building,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, session, logout } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const handleSignOut = () => {
    onClose();
    logout();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      className="max-w-md"
    >
      <div className="space-y-5">
        {/* User Identity Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div
            className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner"
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate">
              {profile?.full_name || 'GymSync Member'}
            </h3>
            <div className="text-xs font-mono text-[#a1a1aa] truncate mt-0.5">
              {profile?.roll_number || 'IIITDM Campus Member'}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="blue" className="text-[10px] capitalize">
                Role: {profile?.role || 'student'}
              </Badge>
              <Badge variant="green" className="text-[10px]">
                Active Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Member Details Breakdown */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-lg bg-[#18181c] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#71717a]">
              <Mail size={14} className="text-blue-400" aria-hidden="true" />
              <span>Email Account</span>
            </div>
            <span className="font-mono text-zinc-300 truncate max-w-[200px]">
              {session?.user?.email || 'member@iiitdm.ac.in'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#18181c] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#71717a]">
              <CreditCard size={14} className="text-emerald-400" aria-hidden="true" />
              <span>Roll / ID Number</span>
            </div>
            <span className="font-mono text-zinc-300">
              {profile?.roll_number || 'IIITDM Member'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#18181c] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#71717a]">
              <Building size={14} className="text-amber-400" aria-hidden="true" />
              <span>Campus Facility</span>
            </div>
            <span className="text-zinc-300">IIITDM Sports Complex</span>
          </div>
        </div>

        {/* Quick Student Shortcuts */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#71717a]">
            Quick Actions
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/planner"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-zinc-300 hover:text-white transition-colors no-underline text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Calendar size={14} className="text-blue-400 shrink-0" aria-hidden="true" />
              <span>Workout Planner</span>
            </Link>

            <Link
              to="/dashboard#activity"
              onClick={onClose}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-zinc-300 hover:text-white transition-colors no-underline text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Activity size={14} className="text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Activity History</span>
            </Link>
          </div>

          {/* Admin Switcher if role is admin */}
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition-colors no-underline text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex items-center gap-2">
                <Shield size={14} aria-hidden="true" />
                <span>Switch to Admin Command Center</span>
              </div>
              <span className="text-[10px] uppercase font-bold">Open →</span>
            </Link>
          )}
        </div>

        {/* Sign Out Action */}
        <div className="pt-2 border-t border-white/10">
          <Button
            variant="danger"
            className="w-full justify-center gap-2 text-xs py-2.5"
            onClick={handleSignOut}
            iconLeft={<LogOut size={14} aria-hidden="true" />}
          >
            Sign Out of GymSync
          </Button>
        </div>
      </div>
    </Modal>
  );
};
