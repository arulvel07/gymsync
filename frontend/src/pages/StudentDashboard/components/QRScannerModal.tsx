import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, KeyRound } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSubmit: (token: string) => void;
  onCameraNotice?: (msg: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onTokenSubmit,
  onCameraNotice,
}) => {
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        try {
          if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {});
          }
          const html5QrCode = new Html5Qrcode('qr-reader-student-modal');
          scannerRef.current = html5QrCode;
          html5QrCode
            .start(
              { facingMode: 'environment' },
              { fps: 10, qrbox: { width: 220, height: 220 } },
              (decodedText) => {
                let token = decodedText.trim();
                if (token.includes('token=')) {
                  const match = token.match(/token=([a-zA-Z0-9]+)/);
                  if (match) token = match[1];
                }
                html5QrCode.stop().catch(() => {});
                onClose();
                onTokenSubmit(token);
              },
              () => {}
            )
            .catch(() => {
              if (onCameraNotice) {
                onCameraNotice(
                  'Camera unavailable or permissions needed. Enter the 12-character code below.'
                );
              }
            });
        } catch (e) {
          console.warn('Scanner initialization note:', e);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    onClose();
    onTokenSubmit(manualToken.trim());
    setManualToken('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Entrance Code">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="blue" className="gap-1">
            <Camera className="w-3 h-3" /> Camera Scanner
          </Badge>
          <span className="text-[11px] text-zinc-400">Position QR within frame</span>
        </div>

        <div
          id="qr-reader-student-modal"
          className="w-full rounded-xl overflow-hidden bg-[#09090b] border border-white/10 min-h-[220px] flex items-center justify-center text-xs text-[#71717a]"
        />

        <div className="pt-3 border-t border-white/10">
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label htmlFor="manual-otp-input" className="block text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              Or enter the 12-character entrance code:
            </label>
            <div className="flex gap-2">
              <Input
                id="manual-otp-input"
                placeholder="e.g. 8f92a7c1e43b"
                className="font-mono lowercase text-xs"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
              />
              <Button variant="primary" size="sm" type="submit">
                Submit Code
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
