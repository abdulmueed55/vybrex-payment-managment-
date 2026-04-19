export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
      {message && <p className="text-zinc-500 text-sm mb-6 max-w-sm">{message}</p>}
      {action}
    </div>
  );
}
