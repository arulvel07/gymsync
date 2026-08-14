import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { adminApi } from '@/services/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import type { GymConfig } from '@/types';
import { QREntranceKiosk } from './components/QREntranceKiosk';
import { AdminOverview } from './components/AdminOverview';
import { AttendanceAudit } from './components/AttendanceAudit';
import { AdminAnalytics } from './components/AdminAnalytics';

export const AdminDashboardPage: React.FC = () => {
  const location = useLocation();
  const { showToast } = useToast();

  // Determine active section from route
  const currentPath = location.pathname;
  let section = 'overview';
  if (currentPath.includes('/attendance')) section = 'attendance';
  else if (currentPath.includes('/analytics')) section = 'analytics';
  else if (currentPath.includes('/config')) section = 'config';
  else if (currentPath.includes('/qr')) section = 'qr';

  // Config State
  const [config, setConfig] = useState<GymConfig | null>(null);
  const [maxCapacity, setMaxCapacity] = useState(50);
  const [openTime, setOpenTime] = useState('05:00');
  const [closeTime, setCloseTime] = useState('09:00');
  const [openTime2, setOpenTime2] = useState('17:00');
  const [closeTime2, setCloseTime2] = useState('22:00');
  const [isOpen, setIsOpen] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);

  const loadConfigData = async () => {
    try {
      const cfg = await adminApi.getGymConfig();
      setConfig(cfg);
      setMaxCapacity(cfg.max_capacity);
      setOpenTime(cfg.open_time?.substring(0, 5) || '05:00');
      setCloseTime(cfg.close_time?.substring(0, 5) || '09:00');
      setOpenTime2(cfg.open_time_2?.substring(0, 5) || '17:00');
      setCloseTime2(cfg.close_time_2?.substring(0, 5) || '22:00');
      setIsOpen(cfg.is_open);
    } catch (err) {
      console.error('[Admin] Error loading config:', err);
    }
  };

  useEffect(() => {
    if (section === 'config') {
      loadConfigData();
    }
  }, [section]);

  // Config Submit
  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      await adminApi.updateGymConfig({
        max_capacity: maxCapacity,
        open_time: openTime,
        close_time: closeTime,
        open_time_2: openTime2,
        close_time_2: closeTime2,
        is_open: isOpen,
      });
      showToast('Gym configuration updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update config', 'error');
    } finally {
      setConfigSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* SECTION 1: OVERVIEW / COMMAND CENTER */}
      {(section === 'overview' || currentPath === '/admin') && (
        <AdminOverview />
      )}

      {/* SECTION 2: ATTENDANCE LOGS */}
      {section === 'attendance' && <AttendanceAudit />}

      {/* SECTION 3: ANALYTICS */}
      {section === 'analytics' && <AdminAnalytics />}

      {/* SECTION 4: FACILITY CONFIG */}
      {section === 'config' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-1">System Parameters</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#fafafa] tracking-tight">Facility Configuration</h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 leading-relaxed">Manage operational hours, max occupancy limits, and emergency facility open/close controls.</p>
          </div>

          <Card className="p-8 max-w-[520px]">
            <form onSubmit={handleConfigSubmit}>
              <div className="mb-5">
                <Input
                  label="Max Rated Capacity"
                  type="number"
                  min={1}
                  max={500}
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 50)}
                />
                <p className="text-[0.72rem] text-[#71717a] mt-1">Maximum allowed headcount before triggering full capacity warnings.</p>
              </div>

              <div className="text-xs font-bold text-[#71717a] uppercase mb-2">Shift 1 (Morning)</div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <Input
                  label="Opening Time"
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                />
                <Input
                  label="Closing Time"
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                />
              </div>

              <div className="text-xs font-bold text-[#71717a] uppercase mb-2">Shift 2 (Evening)</div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <Input
                  label="Opening Time"
                  type="time"
                  value={openTime2}
                  onChange={(e) => setOpenTime2(e.target.value)}
                />
                <Input
                  label="Closing Time"
                  type="time"
                  value={closeTime2}
                  onChange={(e) => setCloseTime2(e.target.value)}
                />
              </div>

              <div className="p-4 mb-6 bg-white/[0.02] border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <label htmlFor="facility-status-toggle" className="text-xs font-semibold text-white block cursor-pointer">
                    Facility Operational Status
                  </label>
                  <div className="text-[0.75rem] text-[#a1a1aa]">Toggle to immediately mark gym Open or Closed</div>
                </div>
                <input
                  id="facility-status-toggle"
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full py-3 text-sm font-semibold" loading={configSaving}>
                Save Configuration Parameters
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* SECTION 5: DYNAMIC QR CHECK-IN KIOSK */}
      {section === 'qr' && (
        <div className="animate-fade-in-up">
          <QREntranceKiosk />
        </div>
      )}
    </div>
  );
};
