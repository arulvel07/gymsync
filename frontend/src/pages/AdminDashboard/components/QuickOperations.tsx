import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QrCode, Activity, BarChart3, Settings, Download, ArrowUpRight } from 'lucide-react';

interface QuickOperationsProps {
  onExportCSV: () => void;
  exporting?: boolean;
}

export const QuickOperations: React.FC<QuickOperationsProps> = ({ onExportCSV, exporting = false }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Entrance QR Display',
      description: 'Open dynamic check-in kiosk for facility entrance',
      icon: QrCode,
      onClick: () => navigate('/admin/qr'),
      accent: 'text-blue-400',
    },
    {
      title: 'Attendance Register',
      description: 'Review & search student attendance and audit logs',
      icon: Activity,
      onClick: () => navigate('/admin/attendance'),
      accent: 'text-emerald-400',
    },
    {
      title: 'Gym Insights',
      description: 'View traffic trends, peak slots, and workout focus',
      icon: BarChart3,
      onClick: () => navigate('/admin/analytics'),
      accent: 'text-indigo-400',
    },
    {
      title: 'Facility Settings',
      description: 'Manage operating hours, capacity limits, and open/closed state',
      icon: Settings,
      onClick: () => navigate('/admin/config'),
      accent: 'text-cyan-400',
    },
  ];

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-1.5">
            <Settings size={14} className="text-blue-400" /> Quick Operations
          </div>
          <span className="text-[0.72rem] text-zinc-500 font-mono">
            Facility Controls
          </span>
        </div>

        {/* Action List */}
        <div className="space-y-2">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className="w-full text-left p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded bg-white/5 ${action.accent}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1">
                      {action.title}
                    </div>
                    <div className="text-[0.7rem] text-zinc-400">
                      {action.description}
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-white transition-colors opacity-60 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </div>

      {/* CSV Export Action Button */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-center text-xs"
          onClick={onExportCSV}
          loading={exporting}
        >
          <Download size={14} /> Export Today's Attendance CSV
        </Button>
      </div>
    </Card>
  );
};
