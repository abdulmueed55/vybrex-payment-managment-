export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-2xl p-6">
        <div className={`w-12 h-12 rounded-full ${danger ? 'bg-red-500/20' : 'bg-yellow-500/20'} flex items-center justify-center mb-4`}>
          <span className="text-2xl">{danger ? '⚠️' : '❓'}</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={danger ? 'bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors' : 'btn-primary'}
          >
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
