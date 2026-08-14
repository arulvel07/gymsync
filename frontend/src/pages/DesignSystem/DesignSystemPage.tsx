import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { DateInput } from '@/components/ui/DateInput';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusIndicator, StatusType } from '@/components/ui/StatusIndicator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonDistribution } from '@/components/ui/Skeleton';
import { Spinner, PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { GymClosedState } from '@/components/ui/GymClosedState';
import { OccupancyGauge } from '@/components/ui/OccupancyGauge';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { DoughnutChart } from '@/components/charts/DoughnutChart';

import {
  Activity,
  Users,
  Clock,
  Dumbbell,
  Calendar as CalendarIcon,
  QrCode,
  ShieldCheck,
  Download,
  Settings,
  LogIn,
  LogOut,
  Flame,
  Plus,
  Trash2,
  User,
} from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [toggleState, setToggleState] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);
  const [radioState, setRadioState] = useState('option1');

  // Dummy Chart Data
  const sampleDailyStats = [
    { date: '2026-08-01', count: 24 },
    { date: '2026-08-02', count: 32 },
    { date: '2026-08-03', count: 28 },
    { date: '2026-08-04', count: 45 },
    { date: '2026-08-05', count: 38 },
    { date: '2026-08-06', count: 50 },
    { date: '2026-08-07', count: 42 },
  ];

  const samplePeakHours = [
    { hour: 6, avg_visitors: 8 },
    { hour: 8, avg_visitors: 15 },
    { hour: 10, avg_visitors: 12 },
    { hour: 12, avg_visitors: 18 },
    { hour: 14, avg_visitors: 22 },
    { hour: 17, avg_visitors: 44 },
    { hour: 19, avg_visitors: 48 },
    { hour: 21, avg_visitors: 20 },
  ];

  const sampleWorkoutDist = [
    { workout_type: 'Chest', count: 42, percentage: 42 },
    { workout_type: 'Legs', count: 18, percentage: 18 },
    { workout_type: 'Back', count: 15, percentage: 15 },
    { workout_type: 'Cardio', count: 14, percentage: 14 },
    { workout_type: 'Shoulders', count: 11, percentage: 11 },
  ];

  const statuses: StatusType[] = [
    'open',
    'closed',
    'full',
    'active',
    'expired',
    'high',
    'moderate',
    'low',
    'success',
    'warning',
    'danger',
    'info',
    'neutral',
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="blue" icon={<Activity className="w-3.5 h-3.5" />}>
            DESIGN SYSTEM SHOWCASE
          </Badge>
          <span className="text-xs text-[#71717a]">Phase 2 Visual Foundation</span>
        </div>
        <h1 className="text-display tracking-tight text-[#fafafa]">GymSync Component Laboratory</h1>
        <p className="text-body-small text-[#a1a1aa] mt-1 max-w-2xl">
          Centralized UI primitives, design tokens, responsive guidelines, and accessibility foundation.
        </p>
      </div>

      {/* 1. Colors */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">1. Color System</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="p-4 rounded-lg bg-[#09090b] border border-white/10 space-y-2">
            <div className="w-full h-8 rounded-md bg-[#09090b] border border-white/20" />
            <div className="text-xs font-semibold text-[#fafafa]">Background</div>
            <div className="text-[10px] text-[#71717a]">#09090b</div>
          </div>
          <div className="p-4 rounded-lg bg-[#121215] border border-white/10 space-y-2">
            <div className="w-full h-8 rounded-md bg-[#121215] border border-white/20" />
            <div className="text-xs font-semibold text-[#fafafa]">Surface</div>
            <div className="text-[10px] text-[#71717a]">#121215</div>
          </div>
          <div className="p-4 rounded-lg bg-[#1f1f24] border border-white/10 space-y-2">
            <div className="w-full h-8 rounded-md bg-[#1f1f24] border border-white/20" />
            <div className="text-xs font-semibold text-[#fafafa]">Elevated</div>
            <div className="text-[10px] text-[#71717a]">#1f1f24</div>
          </div>
          <div className="p-4 rounded-lg bg-[#121215] border border-white/10 space-y-2">
            <div className="w-full h-8 rounded-md bg-blue-600" />
            <div className="text-xs font-semibold text-blue-400">Accent</div>
            <div className="text-[10px] text-[#71717a]">#3b82f6</div>
          </div>
          <div className="p-4 rounded-lg bg-[#121215] border border-white/10 space-y-2">
            <div className="w-full h-8 rounded-md bg-emerald-600" />
            <div className="text-xs font-semibold text-emerald-400">Success</div>
            <div className="text-[10px] text-[#71717a]">#10b981</div>
          </div>
          <div className="p-4 rounded-lg bg-[#121215] border border-white/10 space-y-2">
            <div className="w-full h-8 rounded-md bg-red-600" />
            <div className="text-xs font-semibold text-red-400">Danger</div>
            <div className="text-[10px] text-[#71717a]">#ef4444</div>
          </div>
        </div>
      </section>

      {/* 2. Typography */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">2. Typography Hierarchy</h2>
        <Card className="space-y-4">
          <CardContent className="space-y-4 divide-y divide-white/5">
            <div>
              <span className="text-caption block mb-1">text-display</span>
              <p className="text-display">36px Display Heading</p>
            </div>
            <div className="pt-3">
              <span className="text-caption block mb-1">text-h1</span>
              <p className="text-h1">28px Section Title</p>
            </div>
            <div className="pt-3">
              <span className="text-caption block mb-1">text-h2</span>
              <p className="text-h2">20px Card Header Title</p>
            </div>
            <div className="pt-3">
              <span className="text-caption block mb-1">text-h3</span>
              <p className="text-h3">16px Block Title</p>
            </div>
            <div className="pt-3">
              <span className="text-caption block mb-1">text-body</span>
              <p className="text-body">14px Regular Body text explaining facility details.</p>
            </div>
            <div className="pt-3">
              <span className="text-caption block mb-1">text-label</span>
              <p className="text-label">12px UPPERCASE LABEL</p>
            </div>
            <div className="pt-3">
              <span className="text-caption block mb-1">text-metric</span>
              <p className="text-metric text-blue-400">18 / 50</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Buttons */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">3. Button System</h2>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <span className="text-label block">Variants</span>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Action</Button>
                <Button variant="success">Success Action</Button>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-label block">With Icons & States</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" iconLeft={<Plus className="w-4 h-4" />}>
                  Check In
                </Button>
                <Button variant="secondary" iconLeft={<Download className="w-4 h-4" />}>
                  Export Report
                </Button>
                <Button variant="danger" iconLeft={<Trash2 className="w-4 h-4" />}>
                  End Session
                </Button>
                <Button variant="primary" loading>
                  Processing
                </Button>
                <Button variant="secondary" disabled>
                  Disabled State
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-label block">Sizes</span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (32px)</Button>
                <Button size="md">Medium (40px)</Button>
                <Button size="lg">Large (48px)</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Form Controls */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">4. Form Input System</h2>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Student Roll Number" placeholder="e.g. ME24I1007" startIcon={<User className="w-4 h-4" />} />
            <SearchInput
              label="Student Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
            />
            <DateInput label="Session Date" />
            <Select label="Workout Focus">
              <option value="chest">Chest & Triceps</option>
              <option value="back">Back & Biceps</option>
              <option value="legs">Legs & Abs</option>
            </Select>
            <Textarea label="Workout Notes" placeholder="Record exercises or target sets..." />
            <div className="space-y-4 pt-2">
              <Checkbox
                label="Receive session summary via email"
                description="Get daily workout logs delivered to your institute email."
                checked={checkboxState}
                onChange={(e) => setCheckboxState(e.target.checked)}
              />
              <div className="space-y-2 pt-2">
                <span className="text-label block">Student Role Selection</span>
                <div className="flex gap-6">
                  <Radio
                    label="Student"
                    name="roleGroup"
                    checked={radioState === 'option1'}
                    onChange={() => setRadioState('option1')}
                  />
                  <Radio
                    label="Administrator"
                    name="roleGroup"
                    checked={radioState === 'option2'}
                    onChange={() => setRadioState('option2')}
                  />
                </div>
              </div>
              <Toggle
                label="Gym Operational Status"
                description="Toggle manual facility open/closed override."
                checked={toggleState}
                onChange={setToggleState}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5. Badges & Status */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">5. Status Badges & Indicators</h2>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <span className="text-label block">Semantic Status Badges</span>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <StatusBadge key={s} status={s} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-label block">Dot Indicators (With Pulse)</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <StatusIndicator status="open" pulse />
                  <span className="text-xs text-[#a1a1aa]">Live Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIndicator status="moderate" />
                  <span className="text-xs text-[#a1a1aa]">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIndicator status="closed" />
                  <span className="text-xs text-[#a1a1aa]">Facility Closed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6. Occupancy Gauge */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">6. Occupancy Gauge Foundation</h2>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <span className="text-label block mb-4">Size: Small (Light)</span>
              <OccupancyGauge currentCount={12} maxCapacity={50} percentage={24} isOpen size="sm" />
            </div>
            <div>
              <span className="text-label block mb-4">Size: Medium (Moderate)</span>
              <OccupancyGauge currentCount={32} maxCapacity={50} percentage={64} isOpen size="md" />
            </div>
            <div>
              <span className="text-label block mb-4">Size: Large (Full)</span>
              <OccupancyGauge currentCount={48} maxCapacity={50} percentage={96} isOpen size="lg" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 7. Tables */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">7. Table Foundation</h2>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Sessions</CardTitle>
            <CardDescription>Reusable table rendering with clean typography and hover states.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Workout</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-[#fafafa]">
                    Dharmendra <span className="text-xs text-[#71717a] font-normal block">ME24I1007</span>
                  </TableCell>
                  <TableCell>09:22 AM</TableCell>
                  <TableCell>Chest</TableCell>
                  <TableCell>45 mins</TableCell>
                  <TableCell>
                    <StatusBadge status="active" />
                  </TableCell>
                </TableRow>
                <TableRow selected>
                  <TableCell className="font-semibold text-[#fafafa]">
                    Alex Mercer <span className="text-xs text-[#71717a] font-normal block">CS24B1002</span>
                  </TableCell>
                  <TableCell>08:15 AM</TableCell>
                  <TableCell>Back</TableCell>
                  <TableCell>60 mins</TableCell>
                  <TableCell>
                    <StatusBadge status="expired" label="CHECKED OUT" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* 8. Toasts & Modals */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">8. Feedback (Toasts & Modals)</h2>
        <Card>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="secondary" onClick={() => toast.success('Checked in successfully.')}>
              Trigger Success Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.error('The gym is currently full.')}>
              Trigger Error Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.warning('Operating shift ends in 15 minutes.')}>
              Trigger Warning Toast
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Standard Modal
            </Button>
          </CardContent>
        </Card>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Facility Configuration Change"
          description="Are you sure you want to update maximum capacity for Shift 1?"
          actions={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Save Changes
              </Button>
            </>
          }
        >
          <p className="text-sm text-[#a1a1aa]">
            This will update capacity settings across the active entrance kiosk and mobile scanner endpoints immediately.
          </p>
        </Modal>
      </section>

      {/* 9. Loading & Skeletons */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">9. Intentional Skeletons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonTable rows={3} cols={3} />
          <Card className="p-6">
            <div className="text-xs uppercase font-bold text-zinc-400 mb-3">Workout Distribution Skeleton</div>
            <SkeletonDistribution items={4} />
          </Card>
        </div>
      </section>

      {/* 10. Contextual Empty & Error States */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">10. Contextual Empty & Error States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <EmptyState
              title="No upcoming workouts"
              description="Your schedule is clear. Plan your next session to keep your routine on track."
              primaryAction={<Button size="sm">Plan a workout</Button>}
            />
          </Card>
          <Card>
            <EmptyState
              title="No attendance records found"
              description="Try changing your search or filters."
              primaryAction={<Button variant="secondary" size="sm">Clear filters</Button>}
            />
          </Card>
          <Card>
            <ErrorState
              title="Unable to load activity"
              message="Your data is safe. We just couldn't reach the gym server."
              onRetry={() => alert('Retrying activity...')}
            />
          </Card>
          <Card>
            <ErrorState
              title="Unable to load workout plan"
              message="Your workout plans are safe. We just couldn't reach the gym server."
              onRetry={() => alert('Retrying plan...')}
            />
          </Card>
        </div>
      </section>

      {/* 11. Gym Closed States */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">11. Gym Closed States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <GymClosedState
            title="Gym Closed"
            closingTime="10:00 PM"
            nextAvailableDate="Tomorrow"
            nextAvailableTime="6:00 AM"
            onViewSchedule={() => alert('Opening schedule...')}
          />
          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-xs font-bold text-zinc-400 mb-2">Inline Closed Banner</div>
              <GymClosedState
                variant="inline"
                title="Gym Closed"
                closingTime="10:00 PM"
                onViewSchedule={() => alert('Opening schedule...')}
              />
            </Card>
          </div>
        </div>
      </section>

      {/* 11. Chart Foundation */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">11. Chart Foundation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartContainer title="Visitor Activity" description="30-day visitor trends">
            <LineChart data={sampleDailyStats} />
          </ChartContainer>
          <ChartContainer title="Workout Distribution" description="30-day focus breakdown">
            <DoughnutChart data={sampleWorkoutDist} />
          </ChartContainer>
        </div>
      </section>

      {/* 12. Standardized Iconography System */}
      <section className="space-y-4">
        <h2 className="text-h2 font-bold text-[#fafafa]">12. Standardized Iconography System</h2>
        <Card className="p-6">
          <p className="text-xs text-[#a1a1aa] mb-6 leading-relaxed">
            GymSync uses <strong className="text-white">Lucide React</strong> exclusively across all operational screens. Icons are strictly kept small (<code className="text-blue-400 font-mono">14px–18px</code>), visually restrained, and reserved for establishing information hierarchy or indicating state.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: Activity, name: 'Activity', size: '16px', role: 'Telemetry / Cardio' },
              { icon: Users, name: 'Users', size: '16px', role: 'Headcount / Capacity' },
              { icon: Clock, name: 'Clock', size: '16px', role: 'Duration / Shift' },
              { icon: Dumbbell, name: 'Dumbbell', size: '16px', role: 'Workout Focus' },
              { icon: CalendarIcon, name: 'Calendar', size: '16px', role: 'Planner / History' },
              { icon: QrCode, name: 'QrCode', size: '16px', role: 'Entrance / Kiosk' },
              { icon: ShieldCheck, name: 'ShieldCheck', size: '16px', role: 'Admin Verification' },
              { icon: Download, name: 'Download', size: '16px', role: 'CSV Export' },
              { icon: Settings, name: 'Settings', size: '16px', role: 'Facility Config' },
              { icon: LogIn, name: 'LogIn', size: '16px', role: 'Sign In Action' },
              { icon: LogOut, name: 'LogOut', size: '16px', role: 'Sign Out Action' },
              { icon: Flame, name: 'Flame', size: '16px', role: 'Legs / High Load' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.name}
                  className="p-3.5 rounded-lg bg-[#18181c] border border-white/5 flex flex-col items-center text-center gap-2"
                >
                  <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                    <IconComp size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#fafafa]">{item.name}</div>
                    <div className="text-[0.68rem] font-mono text-[#71717a]">{item.role}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-6 text-xs text-[#a1a1aa]">
            <div>
              <span className="font-semibold text-white">Rule 1:</span> Small sizing (<code className="text-blue-400">w-3.5 h-3.5</code> or <code className="text-blue-400">w-4 h-4</code>).
            </div>
            <div>
              <span className="font-semibold text-white">Rule 2:</span> Inherit text color or use semantic state colors (Green/Amber/Red).
            </div>
            <div>
              <span className="font-semibold text-white">Rule 3:</span> Set <code className="text-blue-400">aria-hidden="true"</code> on decorative icons.
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
