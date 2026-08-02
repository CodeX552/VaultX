import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/Modal';
import { VaultForm, type VaultFormValues } from '../components/VaultForm';
import { VaultList } from '../components/VaultList';
import { VaultStatsCard } from '../components/VaultStatsCard';
import { useAuth } from '../hooks/useAuth';
import { createVaultItem, deleteVaultItem, exportVaultCsv, getAuditLogs, getDashboardStats, getVaultItems, getVaultPasswordHistory, importVaultCsv, updateVaultItem, viewVaultPassword } from '../services/vaultService';
import { changeMasterPasswordRequest } from '../services/authService';
import type { AuditLogEntry, VaultCategory, VaultHistoryEntry, VaultItem } from '../types/vault';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function DashboardPage() {
  // Dashboard me data fetching, filters, modals aur actions sab manage ho rahe hain.
  const { user, logout } = useAuth();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<VaultCategory | ''>('');
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<VaultItem | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [historyEntries, setHistoryEntries] = useState<VaultHistoryEntry[] | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<VaultItem | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const importInputId = 'vault-import-input';

  const categoryOptions = useMemo(() => ['SOCIAL', 'BANK', 'WORK', 'SHOPPING', 'EDUCATION', 'CUSTOM'] as VaultCategory[], []);

  async function loadData() {
    // Search/filter ke saath latest vault stats aur activity lana.
    setLoading(true);
    const [vaultItems, dashboardStats, logs] = await Promise.all([
      getVaultItems(search || undefined, category || undefined),
      getDashboardStats(),
      getAuditLogs()
    ]);
    setItems(vaultItems);
    setStats(dashboardStats);
    setAuditLogs(logs);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, [search, category]);

  async function handleFormSubmit(values: VaultFormValues) {
    // Edit mode me update, warna new entry create hoti hai.
    setFeedback(null);

    if (editItem) {
      await updateVaultItem(editItem.id, values);
      setFeedback('Vault entry updated.');
    } else {
      await createVaultItem(values);
      setFeedback('Vault entry added.');
    }

    setFormOpen(false);
    setEditItem(null);
    await loadData();
  }

  async function handleReveal(item: VaultItem) {
    // Password ko sirf user ke click par fetch karte hain.
    setSelectedItem(item);
    setRevealedPassword(await viewVaultPassword(item.id));
  }

  async function handleHistory(item: VaultItem) {
    // Purane password versions dekhne ke liye history call.
    setSelectedHistoryItem(item);
    setHistoryEntries(await getVaultPasswordHistory(item.id));
  }

  async function handleCopy(item: VaultItem) {
    // Revealed password ko clipboard me copy karte hain.
    const password = await viewVaultPassword(item.id);
    await navigator.clipboard.writeText(password);
    setFeedback(`Password copied for ${item.website}.`);
  }

  async function handleDelete(item: VaultItem) {
    // Vault item delete karke list refresh karte hain.
    await deleteVaultItem(item.id);
    setFeedback(`${item.website} removed.`);
    await loadData();
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">VaultX Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Welcome back, {user?.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-300">Manage encrypted credentials, inspect password strength, and keep your vault organized by category.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
            Add Password
          </button>
          <button
            onClick={async () => {
              // Backend se CSV blob leke browser download trigger karte hain.
              const blob = await exportVaultCsv();
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = 'vaultx-export.csv';
              anchor.click();
              URL.revokeObjectURL(url);
              setFeedback('Vault exported as CSV.');
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Export CSV
          </button>
          <label htmlFor={importInputId} className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Import CSV
          </label>
          <input
            id={importInputId}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (event) => {
              // File text padhke backend import endpoint ko bhej rahe hain.
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              const csv = await file.text();
              const result = await importVaultCsv(csv);
              setFeedback(`Imported ${result.importedCount} vault entries.`);
              event.target.value = '';
              await loadData();
            }}
          />
          <button onClick={logout} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Logout
          </button>
          <button onClick={() => setChangePasswordOpen(true)} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Change Master Password
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <VaultStatsCard label="Total Passwords" value={stats?.totalPasswords ?? 0} tone="text-emerald-300" />
        <VaultStatsCard label="Weak Passwords" value={stats?.weakPasswordCount ?? 0} tone="text-rose-300" />
        <VaultStatsCard label="Strong Passwords" value={stats?.strongPasswordCount ?? 0} tone="text-cyan-300" />
        <VaultStatsCard label="Recently Added" value={stats?.recentlyAdded.length ?? 0} tone="text-amber-300" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[1.6fr,1fr,auto]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by website, username, or email"
              className="field-input"
            />
            <select value={category} onChange={(event) => setCategory(event.target.value as VaultCategory | '')} className="field-input">
              <option value="">All Categories</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button onClick={loadData} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Refresh
            </button>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center text-slate-400">Loading vault entries...</div>
            ) : (
              <VaultList
                items={items}
                onView={handleReveal}
                onEdit={(item) => {
                  setEditItem(item);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onHistory={handleHistory}
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Category Statistics</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {Object.entries(stats?.categoryStatistics ?? {}).length ? Object.entries(stats?.categoryStatistics ?? {}).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <span>{name}</span>
                  <span className="font-semibold text-white">{value}</span>
                </div>
              )) : (
                <p className="text-slate-400">No category data yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <div className="mt-4 space-y-3">
              {auditLogs.length ? auditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3">
                  <p className="font-medium text-white">{log.action}</p>
                  <p className="text-sm text-slate-400">{log.entity} {log.entityId ? `#${log.entityId}` : ''}</p>
                </div>
              )) : (
                <p className="text-slate-400">No activity yet.</p>
              )}
            </div>
          </div>

          {feedback ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{feedback}</div> : null}
        </div>
      </div>

      {formOpen ? (
        <Modal title={editItem ? 'Edit Password Entry' : 'Add Password Entry'} onClose={() => { setFormOpen(false); setEditItem(null); }}>
          <VaultForm
            initialValue={editItem}
            onSubmit={handleFormSubmit}
            onCancel={() => { setFormOpen(false); setEditItem(null); }}
          />
        </Modal>
      ) : null}

      {revealedPassword ? (
        <Modal title={selectedItem ? `Password for ${selectedItem.website}` : 'Password'} onClose={() => { setRevealedPassword(null); setSelectedItem(null); }}>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 font-mono text-sm text-cyan-200 break-all">{revealedPassword}</div>
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(revealedPassword);
                  setFeedback('Password copied to clipboard.');
                }}
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Copy Password
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {historyEntries ? (
        <Modal title={selectedHistoryItem ? `Password History for ${selectedHistoryItem.website}` : 'Password History'} onClose={() => { setHistoryEntries(null); setSelectedHistoryItem(null); }}>
          <div className="space-y-3">
            {historyEntries.length ? historyEntries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-4">
                <p className="font-mono text-sm text-cyan-200 break-all">{entry.password}</p>
                <p className="mt-2 text-xs text-slate-400">Saved {new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            )) : (
              <p className="text-slate-400">No password history found.</p>
            )}
          </div>
        </Modal>
      ) : null}

      {changePasswordOpen ? (
        <ChangePasswordModal
          onClose={() => setChangePasswordOpen(false)}
          onSubmit={async (values) => {
            await changeMasterPasswordRequest(values);
            setFeedback('Master password changed. Please sign in again.');
            await logout();
            setChangePasswordOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(12, 'Password must be at least 12 characters')
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

function ChangePasswordModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (values: ChangePasswordValues) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: ''
    }
  });

  return (
    <Modal title="Change Master Password" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Current Password</span>
          <input {...register('currentPassword')} type="password" className="field-input" />
          {errors.currentPassword ? <span className="mt-2 block text-xs text-rose-300">{errors.currentPassword.message}</span> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">New Password</span>
          <input {...register('newPassword')} type="password" className="field-input" />
          {errors.newPassword ? <span className="mt-2 block text-xs text-rose-300">{errors.newPassword.message}</span> : null}
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Cancel</button>
          <button disabled={isSubmitting} type="submit" className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">Update Password</button>
        </div>
      </form>
    </Modal>
  );
}
