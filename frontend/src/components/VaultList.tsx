import type { VaultItem } from '../types/vault';

export function VaultList({ items, onView, onEdit, onDelete, onCopy, onHistory }: {
  items: VaultItem[];
  onView: (item: VaultItem) => void;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
  onCopy: (item: VaultItem) => void;
  onHistory: (item: VaultItem) => void;
}) {
  // Jab vault empty ho to helpful empty state dikhate hain.
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
        No vault entries yet. Add your first password to populate the dashboard.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-glow">
      <div className="grid grid-cols-[2fr,1.4fr,1.2fr,1fr] gap-4 border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">
        <span>Website</span>
        <span>Username / Email</span>
        <span>Category</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-white/10">
        {items.map((item) => (
          // Har row ek vault credential ko represent karti hai.
          <div key={item.id} className="grid grid-cols-[2fr,1.4fr,1.2fr,1fr] gap-4 px-5 py-4 text-sm text-slate-200">
            <div>
              <p className="font-medium text-white">{item.website}</p>
              <p className="mt-1 text-xs text-slate-400">Created {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p>{item.username}</p>
              <p className="text-slate-400">{item.email}</p>
            </div>
            <div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">{item.category}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => onView(item)}>View</ActionButton>
              <ActionButton onClick={() => onCopy(item)}>Copy</ActionButton>
              <ActionButton onClick={() => onHistory(item)}>History</ActionButton>
              <ActionButton onClick={() => onEdit(item)}>Edit</ActionButton>
              <ActionButton destructive onClick={() => onDelete(item)}>Delete</ActionButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, destructive }: { children: React.ReactNode; onClick: () => void; destructive?: boolean }) {
  // Shared button style se actions visually consistent rehte hain.
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${destructive ? 'border-rose-400/30 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
    >
      {children}
    </button>
  );
}
