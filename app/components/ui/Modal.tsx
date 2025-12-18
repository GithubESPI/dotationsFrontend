'use client';
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string | React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
}) => {
  // Fermer avec la touche Escape
  useEffect(() => {
    if (!onClose) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body quand la modal est ouverte
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => {
        // Fermer si on clique sur le backdrop
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Backdrop avec animation */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 opacity-100"
        onClick={onClose || undefined}
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] transform transition-all duration-300 scale-100 opacity-100 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
          {/* Header */}
          {title && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 flex-shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-base sm:text-xl font-semibold text-black dark:text-zinc-50 flex-1 min-w-0 truncate pr-2">
                {typeof title === 'string' ? title : title}
              </h2>
              {showCloseButton && onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
                  aria-label="Fermer"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content - Scrollable */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: title ? 'calc(95vh - 120px)' : 'calc(95vh - 40px)' }}>
            <div className="min-h-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

