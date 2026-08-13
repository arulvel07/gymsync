import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { attendanceApi } from '@/services/api/attendance';
import { OccupancyGauge } from '@/components/ui/OccupancyGauge';
import { Badge } from '@/components/ui/Badge';
import type { OccupancyResponse } from '@/types';
import { getOccupancyLevel } from '@/lib/utils';
import { getWorkoutColor, getWorkoutIcon } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [occupancy, setOccupancy] = useState<OccupancyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-redirect logged-in users
  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  const loadData = async () => {
    try {
      const data = await attendanceApi.getOccupancy();
      setOccupancy(data);
    } catch (err) {
      console.error('[Landing] Occupancy fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const level = occupancy ? getOccupancyLevel(occupancy.percentage) : null;
  const maxDistributionCount = occupancy?.workout_distribution?.length
    ? Math.max(...occupancy.workout_distribution.map((d) => d.count))
    : 1;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b border-white/10">
        <div className="max-w-[1140px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-center">
            
            {/* Left: Overview */}
            <div>
              <div className="mb-4">
                <Badge variant="blue">IIITDM Kancheepuram Sports Complex</Badge>
              </div>
              <h1 className="gradient-text text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                Smart Campus Gym<br />Management Portal
              </h1>
              <p className="text-base text-[#a1a1aa] mb-7 max-w-[520px] leading-relaxed">
                Real-time occupancy tracking, workout focus analytics, digital attendance, and crowd forecasting designed for students and campus management.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="bg-[#3b82f6] text-white text-sm font-medium px-5 py-2.5 rounded border border-white/15 hover:bg-[#2563eb] transition-all inline-flex items-center gap-2"
                >
                  Access Portal
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#live"
                  className="bg-[#121215] text-[#fafafa] text-sm font-medium px-5 py-2.5 rounded border border-white/10 hover:bg-[#1a1a1e] transition-all inline-flex items-center"
                >
                  View Live Status
                </a>
              </div>

              {/* Facility Summary Row */}
              <div className="flex gap-6 mt-10 pt-6 border-t border-white/10">
                <div>
                  <div className="stat-number text-xl text-[#fafafa]">Real-Time</div>
                  <div className="text-xs text-[#71717a]">Occupancy Telemetry</div>
                </div>
                <div>
                  <div className="stat-number text-xl text-[#fafafa]">50</div>
                  <div className="text-xs text-[#71717a]">Max Rated Capacity</div>
                </div>
                <div>
                  <div className="stat-number text-xl text-[#fafafa]">Digital</div>
                  <div className="text-xs text-[#71717a]">Check-In Logging</div>
                </div>
              </div>
            </div>

            {/* Right: Occupancy Widget Card */}
            <div>
              <div className="glass-card p-7 text-center">
                <div className="flex justify-between items-center mb-5 text-left">
                  <div>
                    <h3 className="text-[0.75rem] uppercase tracking-wider text-[#71717a] font-semibold">
                      Facility Status
                    </h3>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: level?.color || '#10b981' }}>
                      {loading ? 'Loading...' : occupancy?.is_open ? level?.label : 'Gym Closed'}
                    </div>
                  </div>
                  <div>
                    {occupancy?.is_open ? (
                      <Badge variant="green">● Open Now</Badge>
                    ) : (
                      <Badge variant="red">● Closed</Badge>
                    )}
                  </div>
                </div>

                {/* SVG Ring Gauge */}
                <OccupancyGauge
                  currentCount={occupancy?.current_count || 0}
                  maxCapacity={occupancy?.max_capacity || 50}
                  percentage={occupancy?.percentage || 0}
                  isOpen={occupancy?.is_open ?? true}
                />

                {/* Active Workout Breakdown */}
                <div className="border-t border-white/10 pt-4 text-left">
                  <div className="text-[0.75rem] font-semibold text-[#71717a] uppercase tracking-wider mb-2.5">
                    Active Workout Focus
                  </div>
                  {occupancy?.workout_distribution?.length ? (
                    occupancy.workout_distribution.slice(0, 4).map((d) => {
                      const pct = (d.count / maxDistributionCount) * 100;
                      const color = getWorkoutColor(d.workout_type);
                      const icon = getWorkoutIcon(d.workout_type);
                      return (
                        <div key={d.workout_type} className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#a1a1aa]">
                              {icon} {d.workout_type}
                            </span>
                            <span className="stat-number font-bold" style={{ color }}>
                              {d.count}
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#71717a]">No active sessions currently</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Status Telemetry Section */}
      <section id="live" className="max-w-[1140px] mx-auto py-16 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold gradient-text mb-1.5">
            Live Gym Telemetry
          </h2>
          <p className="text-[#a1a1aa] text-sm">
            Public status dashboard updated in real-time. No student login required to check occupancy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active Headcount Card */}
          <div className="glass-card p-6">
            <div className="text-xs uppercase tracking-wider text-[#71717a] font-semibold mb-3">
              Active Headcount
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="stat-number text-5xl" style={{ color: level?.color || '#10b981' }}>
                {occupancy?.current_count ?? '—'}
              </span>
              <span className="text-base text-[#71717a]">/ {occupancy?.max_capacity || 50}</span>
            </div>
            <div className="text-sm font-medium" style={{ color: level?.color || '#10b981' }}>
              {loading ? 'Loading facility status...' : occupancy?.is_open ? level?.label : 'Gym Closed'}
            </div>
          </div>

          {/* Workout Split Card */}
          <div className="glass-card p-6">
            <div className="text-xs uppercase tracking-wider text-[#71717a] font-semibold mb-3.5">
              Equipment & Muscle Focus Split
            </div>
            {occupancy?.workout_distribution?.length ? (
              occupancy.workout_distribution.map((d) => {
                const pct = (d.count / maxDistributionCount) * 100;
                const color = getWorkoutColor(d.workout_type);
                const icon = getWorkoutIcon(d.workout_type);
                return (
                  <div key={d.workout_type} className="mb-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#fafafa]">
                        {icon} {d.workout_type}
                      </span>
                      <span className="stat-number" style={{ color }}>
                        {d.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#71717a] py-2">No active sessions currently</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
