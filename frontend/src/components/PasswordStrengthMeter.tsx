export function PasswordStrengthMeter({ label, entropy }: { label: string; entropy: number }) {
  // Strength label ke hisaab se color tone choose kiya ja raha hai.
  const toneMap: Record<string, string> = {
    Weak: 'text-rose-300',
    Medium: 'text-amber-300',
    Strong: 'text-emerald-300',
    'Very Strong': 'text-cyan-300'
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <p className="text-sm text-slate-400">Strength</p>
        <p className={`font-medium ${toneMap[label] ?? 'text-slate-200'}`}>{label}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-400">Entropy</p>
        <p className="font-medium text-white">{entropy} bits</p>
      </div>
    </div>
  );
}
