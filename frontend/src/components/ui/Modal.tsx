import React, { ReactNode, useEffect, useRef } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const generatedId = React.useId();
  const titleId = title ? `modal-title-${generatedId}` : undefined;
  const descId = description ? `modal-desc-${generatedId}` : undefined;

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore focus on close
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside modal
    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          // If there is an input or button inside, focus it
          focusableElements[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    // Keyboard handlers (Escape & Focus Trap)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el: HTMLElement) => el.offsetParent !== null); // only visible elements

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Restore focus
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => closeOnOverlayClick && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full max-w-lg my-auto max-h-[calc(100vh-2rem)] flex flex-col animate-in fade-in zoom-in-95 duration-150 focus:outline-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="relative rounded-2xl border-white/15 shadow-2xl overflow-y-auto max-h-[calc(100vh-2rem)] bg-[#121215]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121215] z-10 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          {(title || description) && (
            <CardHeader className="pr-12">
              {title && <CardTitle id={titleId}>{title}</CardTitle>}
              {description && <CardDescription id={descId}>{description}</CardDescription>}
            </CardHeader>
          )}

          {children && <CardContent className={title || description ? 'pt-2' : ''}>{children}</CardContent>}

          {actions && <CardFooter className="justify-end gap-3">{actions}</CardFooter>}
        </Card>
      </div>
    </div>
  );
};
