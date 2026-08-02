export function VaultStatsCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  // Compact metric card dashboard me quick signal deta hai.
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-4xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
