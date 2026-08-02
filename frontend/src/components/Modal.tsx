import type { ReactNode } from 'react';

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  // Reusable overlay modal component, jo focus ko current task pe rakhta hai.
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-glow">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 transition hover:bg-white/5">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
