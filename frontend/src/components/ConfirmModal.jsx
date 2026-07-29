import { AlertTriangle, X } from 'lucide-react';

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onCancel, onConfirm }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop-custom" role="presentation">
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className="icon-button modal-close" type="button" aria-label="Close" onClick={onCancel}>
          <X size={18} />
        </button>
        <div className="modal-icon">
          <AlertTriangle size={26} />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-light" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
