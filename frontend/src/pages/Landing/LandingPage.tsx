import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { attendanceApi } from '@/services/api/attendance';
import { OccupancyGauge } from '@/components/ui/OccupancyGauge';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonDistribution } from '@/components/ui/Skeleton';
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
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#fafafa] tracking-tight leading-tight mb-4">
                Smart Campus Gym<br />Management Portal
              </h1>
              <p className="text-base text-[#a1a1aa] mb-7 max-w-[520px] leading-relaxed">
                Real-time occupancy tracking, workout focus analytics, digital attendance, and crowd forecasting designed for students and campus management.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="bg-[#3b82f6] text-white text-sm font-medium px-5 py-2.5 rounded border border-white/15 hover:bg-[#2563eb] transition-all inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
                >
                  Access Portal
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href="#live"
                  className="bg-[#121215] text-[#fafafa] text-sm font-medium px-5 py-2.5 rounded border border-white/10 hover:bg-[#1a1a1e] transition-all inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
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
            <div id="live" tabIndex={-1} className="focus:outline-none">
              <div className="glass-card p-7 text-center">
                <div className="flex justify-between items-center mb-5 text-left">
                  <div>
                    <h2 className="text-[0.75rem] uppercase tracking-wider text-[#71717a] font-semibold">
                      Facility Status
                    </h2>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: level?.color || '#10b981' }}>
                      {loading ? <Skeleton height="18px" width="100px" /> : occupancy?.is_open ? level?.label : 'Gym Closed'}
                    </div>
                  </div>
                  <div>
                    {loading ? (
                      <Skeleton height="22px" width="80px" rounded="rounded-full" />
                    ) : occupancy?.is_open ? (
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
                  {loading ? (
                    <SkeletonDistribution items={3} />
                  ) : occupancy?.workout_distribution?.length ? (
                    occupancy.workout_distribution.slice(0, 4).map((d) => {
                      const pct = (d.count / maxDistributionCount) * 100;
                      const color = getWorkoutColor(d.workout_type);
                      return (
                        <div key={d.workout_type} className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#a1a1aa] inline-flex items-center gap-1.5">
                              {getWorkoutIcon(d.workout_type, "w-3.5 h-3.5")}
                              <span>{d.workout_type}</span>
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
                    <div className="text-xs text-[#71717a] py-2">No active sessions reported</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
