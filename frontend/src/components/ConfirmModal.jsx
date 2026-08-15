import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', confirming = false, onCancel, onConfirm }) {
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();

    return () => previousFocus?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !confirming) onCancel();
      if (event.key !== 'Tab') return;

      const focusable = [...modalRef.current.querySelectorAll('button:not(:disabled)')];
      const first = focusable[0];
      const last = focusable.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', closeOnEscape);

    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, confirming, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop-custom" role="presentation">
      <div ref={modalRef} className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <button
          ref={closeButtonRef}
          className="icon-button modal-close"
          type="button"
          aria-label="Close"
          disabled={confirming}
          onClick={onCancel}
        >
          <X size={18} aria-hidden="true" />
        </button>
        <div className="modal-icon">
          <AlertTriangle size={26} aria-hidden="true" />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-light" type="button" disabled={confirming} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" type="button" disabled={confirming} onClick={onConfirm}>
            {confirming ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
