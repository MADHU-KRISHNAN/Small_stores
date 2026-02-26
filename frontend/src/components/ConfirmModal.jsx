import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${danger ? 'bg-red-500/15' : 'bg-brand-500/15'}`}>
                        <ExclamationTriangleIcon className={`w-7 h-7 ${danger ? 'text-red-400' : 'text-brand-400'}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-surface-400 mb-6">{message}</p>
                    <div className="flex space-x-3">
                        <button onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${danger
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                                : 'btn-primary'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
