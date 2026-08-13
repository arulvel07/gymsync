import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export const LoginPage: React.FC = () => {
  const { session, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      const pendingToken = sessionStorage.getItem('pending_qr_token');
      if (pendingToken) {
        navigate(`/check-in?token=${encodeURIComponent(pendingToken)}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [session, navigate]);

  const handleGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const pendingToken = sessionStorage.getItem('pending_qr_token');
      const target = pendingToken ? `/check-in?token=${encodeURIComponent(pendingToken)}` : '/dashboard';
      await signInWithGoogle(target);
    } catch (err: any) {
      console.error('[Login] Google auth error:', err);
      showToast(err.message || 'Google Sign-In failed. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-20 relative">
      <div className="glass-card w-full max-w-[400px] p-8 text-center relative z-10">
        <div className="mb-7">
          <div className="mb-3">
            <Badge variant="blue">IIITDM Single Sign-On</Badge>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-1.5">Login</h1>
          <p className="text-xs text-[#a1a1aa]">
            Access digital attendance, live occupancy, and smart workout planning.
          </p>
        </div>

        {/* Google SSO Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submitting}
            className="w-full py-2.5 px-4 flex items-center justify-center gap-2.5 bg-white text-zinc-900 border border-white/20 rounded font-semibold text-sm cursor-pointer hover:bg-zinc-100 transition-all shadow-sm disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {submitting ? 'Connecting...' : 'Sign In with Google'}
          </button>
        </div>

        {/* Domain Notice */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-[#71717a] leading-relaxed">
            Authorized access only. Authentication is restricted strictly to official{' '}
            <code className="text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">@iiitdm.ac.in</code> institute email accounts.
          </p>
        </div>
      </div>
    </div>
  );
};
