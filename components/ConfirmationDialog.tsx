import React from 'react';
import { useProject } from '../hooks/useProject';

const ConfirmationDialog = () => {
  const { state, clearConfirmation } = useProject();
  const { confirmationRequest } = state;

  if (!confirmationRequest) {
    return null;
  }

  const handleConfirm = () => {
    confirmationRequest.onConfirm();
    clearConfirmation();
  };

  const handleCancel = () => {
    clearConfirmation();
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        handleCancel();
    }
  };

  return (
    <div
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
        aria-labelledby="dialog-title"
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity"
    >
      <div className="bg-background-dark rounded-lg shadow-xl p-6 w-full max-w-sm m-4 transform transition-all">
        <h2 id="dialog-title" className="text-lg font-bold text-text-primary mb-4">{confirmationRequest.message}</h2>
        <div className="flex justify-end space-x-3">
          <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-text-primary bg-background-med hover:bg-border-color rounded transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-accent-red hover:bg-accent-red-hover rounded transition-colors">
            Confirm
          </button>
        </div>
      </div>
      <style>{`
        .fixed { position: fixed; } .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .bg-black { background-color: #000; } .bg-opacity-60 { background-color: rgba(0,0,0,0.6); }
        .flex { display: flex; } .items-center { align-items: center; } .justify-center { justify-content: center; } .justify-end { justify-content: flex-end; }
        .z-50 { z-index: 50; } .transition-opacity { transition: opacity 0.2s; }
        .bg-background-dark { background-color: var(--background-dark); }
        .rounded-lg { border-radius: 0.5rem; } .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .p-6 { padding: 1.5rem; } .w-full { width: 100%; } .max-w-sm { max-width: 24rem; } .m-4 { margin: 1rem; }
        .transform { transform: scale(1); } .transition-all { transition: all 0.2s; }
        .text-lg { font-size: 1.125rem; } .font-bold { font-weight: 700; } .text-text-primary { color: var(--text-primary); }
        .mb-4 { margin-bottom: 1rem; } .space-x-3 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; } .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .text-sm { font-size: 0.875rem; } .font-semibold { font-weight: 600; }
        .bg-background-med { background-color: var(--background-med); } .hover\\:bg-border-color:hover { background-color: var(--border-color); }
        .text-white { color: white; }
        .bg-accent-red { background-color: var(--accent-red); } .hover\\:bg-accent-red-hover:hover { background-color: var(--accent-red-hover); }
        .transition-colors { transition: background-color 0.15s ease-in-out; }
      `}</style>
    </div>
  );
};

export default ConfirmationDialog;
