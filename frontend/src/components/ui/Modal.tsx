import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const titleId = title ? 'modal-title' : undefined;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => closeOnOverlayClick && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-150 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="relative border-white/15 shadow-2xl overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {(title || description) && (
            <CardHeader className="pr-12">
              {title && <CardTitle id={titleId}>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
          )}

          {children && <CardContent className={title || description ? 'pt-2' : ''}>{children}</CardContent>}

          {actions && <CardFooter className="justify-end gap-3">{actions}</CardFooter>}
        </Card>
      </div>
    </div>
  );
};
