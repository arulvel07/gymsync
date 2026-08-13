import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { attendanceApi } from '@/services/api/attendance';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { WORKOUT_TYPES, getWorkoutIcon } from '@/lib/constants';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export const CheckInPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { showToast } = useToast();

  const [tokenState, setTokenState] = useState<'loading' | 'expired' | 'valid' | 'success'>('loading');
  const [expiredMsg, setExpiredMsg] = useState('Please scan the latest QR displayed at the gym.');
  const [token, setToken] = useState<string | null>(null);

  const [selectedWorkout, setSelectedWorkout] = useState<string>('Chest');
  const [customWorkout, setCustomWorkout] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let t = searchParams.get('token');
    if (!t) {
      t = sessionStorage.getItem('pending_qr_token');
    }

    if (!t) {
      setExpiredMsg('❌ No QR Token Provided. Please scan the QR code at the gym entrance.');
      setTokenState('expired');
      return;
    }

    setToken(t);

    // Validate token with backend
    attendanceApi
      .validateQRToken(t)
      .then((valRes) => {
        if (!valRes || !valRes.valid) {
          setExpiredMsg(valRes?.message || '❌ QR Code Expired. Please scan the latest QR displayed at the gym.');
          setTokenState('expired');
        } else {
          // If token is valid but user is not authenticated, store token and redirect to login
          if (!session) {
            sessionStorage.setItem('pending_qr_token', t);
            navigate('/login', { replace: true });
          } else {
            sessionStorage.removeItem('pending_qr_token');
            // Check active session
            attendanceApi.getActiveSession().then((actRes) => {
              if (actRes.active) {
                showToast('You already have an active gym session!', 'info');
                navigate('/dashboard', { replace: true });
              } else {
                setTokenState('valid');
              }
            });
          }
        }
      })
      .catch(() => {
        setExpiredMsg('❌ QR Code Expired. Please scan the latest QR displayed at the gym.');
        setTokenState('expired');
      });
  }, [searchParams, session, navigate]);

  const handleConfirmCheckIn = async () => {
    const finalWorkout = selectedWorkout === 'Others' ? customWorkout.trim() : selectedWorkout;
    if (!finalWorkout) {
      showToast('Please specify a workout focus', 'error');
      return;
    }

    if (!token) return;

    setLoading(true);
    try {
      await attendanceApi.checkIn(finalWorkout, token);
      setTokenState('success');
      showToast(`Checked in! Training ${finalWorkout}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
      if (err.message && err.message.includes('Expired')) {
        setExpiredMsg(err.message);
        setTokenState('expired');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[460px]">
        {/* State 1: Loading */}
        {tokenState === 'loading' && (
          <div className="glass-card p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-base font-semibold mb-1.5">Validating Entrance QR Code...</h2>
            <p className="text-xs text-[#a1a1aa]">Verifying dynamic token expiration with backend telemetry.</p>
          </div>
        )}

        {/* State 2: Expired */}
        {tokenState === 'expired' && (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500 flex items-center justify-center mx-auto mb-5 text-rose-400">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-rose-400 mb-2.5">❌ QR Code Expired</h1>
            <p className="text-xs text-[#a1a1aa] leading-relaxed mb-6">{expiredMsg}</p>
            <Button variant="secondary" className="w-full py-2.5" onClick={() => navigate('/dashboard')}>
              Return to Student Dashboard
            </Button>
          </div>
        )}

        {/* State 3: Valid Token — Select Workout Focus */}
        {tokenState === 'valid' && (
          <div className="glass-card p-7 text-center">
            <div className="mb-5">
              <Badge variant="green" className="mb-2">● Valid Entrance QR Token</Badge>
              <h1 className="text-xl font-bold gradient-text">Select Workout Focus & Check In</h1>
              <p className="text-xs text-[#a1a1aa] mt-1">Instant digital entrance check-in.</p>
            </div>

            {/* Workout Pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {WORKOUT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedWorkout(type)}
                  className={`workout-pill ${selectedWorkout === type ? 'active' : ''}`}
                >
                  <span>{getWorkoutIcon(type)}</span>
                  <span>{type}</span>
                </button>
              ))}
            </div>

            {selectedWorkout === 'Others' && (
              <div className="mb-5 text-left">
                <Input
                  label="Specify Custom Focus"
                  placeholder="e.g. Arms, Abs & Stretching"
                  value={customWorkout}
                  onChange={(e) => setCustomWorkout(e.target.value)}
                />
              </div>
            )}

            <Button
              variant="primary"
              className="w-full py-3 text-sm font-semibold"
              onClick={handleConfirmCheckIn}
              loading={loading}
            >
              Confirm Entrance Check-In
            </Button>
          </div>
        )}

        {/* State 4: Success */}
        {tokenState === 'success' && (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500 flex items-center justify-center mx-auto mb-5 text-emerald-400">
              <CheckCircle2 size={32} />
            </div>
            <Badge variant="green" className="mb-2">● Session Active</Badge>
            <h1 className="text-2xl font-extrabold text-emerald-400 mb-1.5">Checked In Successfully!</h1>
            <p className="text-sm text-[#fafafa] font-semibold mb-5">
              Training Focus: {selectedWorkout === 'Others' ? customWorkout : selectedWorkout}
            </p>
            <Button variant="primary" className="w-full py-2.5" onClick={() => navigate('/dashboard')}>
              View Live Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
