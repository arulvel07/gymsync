import React, { useEffect, useState, useRef, useCallback } from 'react';
import { adminApi } from '@/services/api/admin';
import { attendanceApi } from '@/services/api/attendance';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import type { QRTokenResponse, GymConfig, OccupancyResponse } from '@/types';
import { parseUTC } from '@/lib/utils';
import {
  QrCode,
  Clock,
  ShieldCheck,
  RefreshCw,
  WifiOff,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Lock,
} from 'lucide-react';

export const QREntranceKiosk: React.FC = () => {
  const { showToast } = useToast();

  // Primary State
  const [qrToken, setQrToken] = useState<QRTokenResponse | null>(null);
  const [config, setConfig] = useState<GymConfig | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyResponse | null>(null);

  // Status & Network
  const [loading, setLoading] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Timers & Display State
  const [qrCountdown, setQrCountdown] = useState<string>('07:00');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(420);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch QR Token (Preserving existing API contract)
  const fetchQRTokenData = useCallback(async (force = false) => {
    setIsRotating(true);
    try {
      const data = force ? await adminApi.rotateQRToken() : await adminApi.getQRToken();
      setQrToken(data);
      setError(null);
    } catch (err: any) {
      console.error('[QR Kiosk] Error loading QR token:', err);
      setError(err?.message || 'Unable to load entrance QR token from facility server.');
    } finally {
      setIsRotating(false);
      setLoading(false);
    }
  }, []);

  // 2. Fetch Facility Configuration & Status
  const fetchFacilityStatus = useCallback(async () => {
    try {
      const [cfg, occ] = await Promise.all([
        adminApi.getGymConfig().catch(() => null),
        attendanceApi.getOccupancy().catch(() => null),
      ]);
      if (cfg) setConfig(cfg);
      if (occ) setOccupancy(occ);
    } catch (err) {
      console.error('[QR Kiosk] Error loading facility config:', err);
    }
  }, []);

  // Initial Data Load & Polling setup
  useEffect(() => {
    fetchQRTokenData();
    fetchFacilityStatus();

    // Refresh facility status every 60s
    const statusInterval = setInterval(() => {
      fetchFacilityStatus();
    }, 60000);

    return () => clearInterval(statusInterval);
  }, [fetchQRTokenData, fetchFacilityStatus]);

  // Live Digital Clock Timer (1s)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // 7-Minute Token Countdown Timer (Synced to token.expires_at)
  useEffect(() => {
    if (!qrToken?.expires_at) return;

    const updateCountdown = () => {
      const expiresMs = parseUTC(qrToken.expires_at).getTime();
      const diffMs = expiresMs - Date.now();

      if (diffMs <= 0) {
        setQrCountdown('00:00');
        setRemainingSeconds(0);
        // Auto-rotate QR token on expiry
        fetchQRTokenData(true);
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      setRemainingSeconds(totalSeconds);

      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      setQrCountdown(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [qrToken, fetchQRTokenData]);

  // Fullscreen Change Event Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle Fullscreen Kiosk Presentation
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('[QR Kiosk] Fullscreen toggle failed:', err);
      showToast('Fullscreen mode not permitted by browser settings.', 'info');
    }
  };

  // Copy OTP Code to Clipboard
  const handleCopyOTP = () => {
    if (!qrToken?.token) return;
    navigator.clipboard.writeText(qrToken.token);
    setCopied(true);
    showToast('OTP token code copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine operational states
  const isOpen = config?.is_open ?? occupancy?.is_open ?? true;

  return (
    <div
      ref={containerRef}
      className={`w-full transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#060608] flex flex-col justify-between p-4 sm:p-6 md:p-10 overflow-y-auto'
          : 'relative'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. KIOSK HEADER BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-white/10 mb-4 sm:mb-8">
        {/* Brand & Terminal Designation */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <QrCode size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-xl">GYMSYNC</span>
              <span className="text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25">
                Gym Entrance
              </span>
            </div>
            <p className="text-[0.7rem] sm:text-xs text-[#a1a1aa] font-medium tracking-wide">IIITDM Campus Gym</p>
          </div>
        </div>

        {/* Kiosk Status & System Clock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live System Time */}
          {currentTime && (
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-[#fafafa]">
              <Clock size={14} className="text-blue-400" />
              <span>{currentTime}</span>
            </div>
          )}

          {/* Operational Status Indicator */}
          {error ? (
            <Badge variant="red" icon={<WifiOff size={13} />}>
              <span className="hidden sm:inline">Entrance </span>Offline
            </Badge>
          ) : !isOpen ? (
            <Badge variant="red" icon={<Lock size={13} />}>
              <span className="hidden sm:inline">Gym </span>Closed
            </Badge>
          ) : (
            <Badge variant="green" icon={<ShieldCheck size={13} />}>
              <span className="hidden sm:inline">Entrance </span>Online
            </Badge>
          )}

          {/* Fullscreen Kiosk Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen Mode' : 'Enter Fullscreen Mode'}
            className="text-[#a1a1aa] hover:text-white hover:bg-white/10 p-2 sm:p-2.5 h-auto"
            aria-label={isFullscreen ? 'Exit Fullscreen Mode' : 'Enter Fullscreen Mode'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN KIOSK DISPLAY AREA */}
      {/* ========================================================================= */}
      <div className="max-w-xl mx-auto w-full flex flex-col items-center justify-center text-center">
        {/* ----------------------------------------------------------------------- */}
        {/* STATE A: INITIAL LOADING SKELETON */}
        {/* ----------------------------------------------------------------------- */}
        {loading && (
          <Card className="w-full p-6 sm:p-10 flex flex-col items-center justify-center border-white/10 shadow-2xl">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-sm sm:text-base font-semibold text-white mb-2">Connecting to Entrance System...</h2>
            <p className="text-xs text-[#a1a1aa] max-w-xs">Fetching the active entrance code.</p>
            {/* Skeleton Box */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 bg-white/5 rounded-2xl border border-white/10 mt-6 animate-pulse" />
          </Card>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* STATE B: OFFLINE / ERROR STATE */}
        {/* ----------------------------------------------------------------------- */}
        {!loading && error && (
          <Card className="w-full p-6 sm:p-10 border-rose-500/30 bg-rose-500/5 text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle size={28} className="sm:w-8 sm:h-8" />
            </div>
            <Badge variant="red" className="mb-3">
              System Offline
            </Badge>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Entrance System Offline</h2>
            <p className="text-xs text-[#a1a1aa] max-w-sm mb-6 leading-relaxed">
              Could not connect to the gym server to generate an entrance QR code.
            </p>
            <Button
              variant="primary"
              onClick={() => fetchQRTokenData(true)}
              iconLeft={<RefreshCw size={16} />}
            >
              Try Again
            </Button>
          </Card>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* STATE C: CLOSED FACILITY STATE */}
        {/* ----------------------------------------------------------------------- */}
        {!loading && !error && !isOpen && (
          <Card className="w-full p-6 sm:p-10 border-white/10 bg-[#121215] text-center flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#71717a] mb-4">
              <Lock size={28} className="sm:w-8 sm:h-8" />
            </div>

            <Badge variant="red" className="mb-3">
              ● Gym Closed
            </Badge>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">Gym Closed</h1>
            <p className="text-xs text-[#a1a1aa] max-w-sm mb-6 leading-relaxed">
              Entrance check-in is unavailable while the gym is closed. QR codes will refresh automatically when the gym opens.
            </p>

            {/* Operating Hours Display */}
            {config && (
              <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-xl p-3.5 sm:p-4 text-left mb-6">
                <div className="text-[0.68rem] uppercase font-bold tracking-widest text-[#71717a] mb-2 flex items-center gap-1.5">
                  <Clock size={12} className="text-blue-400" /> Gym Hours
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#71717a] block text-[0.65rem]">Morning Hours</span>
                    <span className="font-mono text-white font-semibold">
                      {config.open_time?.substring(0, 5)} - {config.close_time?.substring(0, 5)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[0.65rem]">Evening Hours</span>
                    <span className="font-mono text-white font-semibold">
                      {config.open_time_2?.substring(0, 5)} - {config.close_time_2?.substring(0, 5)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                fetchFacilityStatus();
                fetchQRTokenData();
              }}
              iconLeft={<RefreshCw size={14} />}
            >
              Check Gym Status
            </Button>
          </Card>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* STATE D: OPEN & ACTIVE QR KIOSK HERO DISPLAY */}
        {/* ----------------------------------------------------------------------- */}
        {!loading && !error && isOpen && (
          <Card className="w-full p-4 sm:p-6 md:p-8 lg:p-10 border-white/10 bg-[#121215] text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
            {/* Status Eyebrow Header */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Badge variant="green">● Open Now</Badge>
              <Badge variant="blue">Refreshes Every 7 Mins</Badge>
            </div>

            {/* Kiosk Action Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
              Scan to Enter
            </h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa] mb-4 sm:mb-6 font-medium">
              Scan with your mobile camera to check in
            </p>

            {/* =================================================================== */}
            {/* HIGH-CONTRAST HERO QR CONTAINER */}
            {/* =================================================================== */}
            <div className="relative group mb-4 sm:mb-6">
              {/* Quiet Zone Frame Outer */}
              <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl shadow-2xl border-4 border-white/10 inline-flex justify-center items-center relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 max-w-full">
                {/* Visual Corner Scanning Bounds */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-black/40" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-black/40" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-black/40" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-black/40" />

                {qrToken?.qr_image ? (
                  <img
                    src={qrToken.qr_image}
                    alt="Gym entrance QR code for student check-in. Scan using mobile camera or enter OTP code."
                    className={`w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-lg block object-contain transition-opacity duration-300 ${
                      isRotating ? 'opacity-30' : 'opacity-100'
                    }`}
                  />
                ) : (
                  <div className="text-zinc-500 text-xs flex flex-col items-center gap-2 py-10" role="status" aria-live="polite">
                    <RefreshCw className="animate-spin text-blue-500" size={24} aria-hidden="true" />
                    <span>Generating Entry Code...</span>
                  </div>
                )}
              </div>

              {/* Refreshing Spinner Overlay during rotation */}
              {isRotating && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center text-white text-xs font-semibold gap-2">
                  <RefreshCw className="animate-spin" size={20} />
                  <span>Refreshing QR...</span>
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* COUNTDOWN DISPLAY CONTAINER */}
            {/* =================================================================== */}
            <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 p-3 sm:p-3.5 rounded-xl mb-3 sm:mb-4 flex flex-col items-center">
              <div className="text-[0.68rem] uppercase font-bold tracking-wider text-[#71717a] mb-0.5 flex items-center gap-1.5">
                <Clock size={12} className="text-blue-400" />
                {remainingSeconds <= 60 ? (
                  <span className="text-amber-400 animate-pulse-subtle flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                    Refreshing Code Soon
                  </span>
                ) : (
                  <span>QR refreshes in</span>
                )}
              </div>

              <div
                className={`font-mono tabular-nums text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider transition-colors duration-250 ${
                  remainingSeconds <= 60 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {qrCountdown}
              </div>
            </div>

            {/* =================================================================== */}
            {/* OTP FALLBACK PRESENTATION */}
            {/* =================================================================== */}
            <div className="w-full max-w-sm bg-blue-500/10 border border-blue-500/25 p-3 sm:p-3.5 rounded-xl mb-4 sm:mb-5 text-center relative">
              <div className="text-[0.65rem] sm:text-[0.68rem] uppercase font-bold tracking-widest text-blue-400 mb-1 flex items-center justify-center gap-1">
                <span>Can't scan? Enter code</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <div className="font-mono text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-[0.12em] sm:tracking-[0.22em] pl-[0.12em] sm:pl-[0.22em] select-all">
                  {qrToken?.token || '------------'}
                </div>
                <button
                  type="button"
                  onClick={handleCopyOTP}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-300 hover:text-white hover:bg-blue-500/30 transition-colors ml-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  title="Copy OTP Code"
                  aria-label="Copy OTP code to clipboard"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* =================================================================== */}
            {/* FOOTER METADATA & MANUAL REFRESH */}
            {/* =================================================================== */}
            <div className="w-full max-w-sm border-t border-white/10 pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left text-xs">
              <div className="min-w-0">
                <span className="text-[0.65rem] uppercase font-bold text-[#71717a] block">Check-in link</span>
                <span className="font-mono text-[0.7rem] text-blue-400/90 truncate block max-w-[180px] sm:max-w-[200px]">
                  {window.location.origin}/check-in
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchQRTokenData(true)}
                disabled={isRotating}
                iconLeft={<RefreshCw size={13} className={isRotating ? 'animate-spin' : ''} />}
                className="shrink-0"
              >
                Refresh Code
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Fullscreen Footer Branding */}
      {isFullscreen && (
        <div className="text-center pt-4 sm:pt-6 text-[0.7rem] sm:text-xs text-[#71717a] font-mono border-t border-white/10 mt-4 sm:mt-6">
          GymSync Entrance Terminal · IIITDM Sports Complex
        </div>
      )}
    </div>
  );
};
