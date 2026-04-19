export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-2xl p-6">
        <div className={`w-12 h-12 rounded-full ${danger ? 'bg-red-50' : 'bg-yellow-50'} flex items-center justify-center mb-4`}>
          <span className="text-2xl">{danger ? '⚠️' : '❓'}</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
        <p className="text-zinc-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
