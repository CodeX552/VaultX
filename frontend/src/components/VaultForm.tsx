import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { VaultCategory, VaultItem } from '../types/vault';
import { generatePassword, getPasswordStrength } from '../utils/passwordGenerator';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

const vaultFormSchema = z.object({
  website: z.string().min(1, 'Website is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  notes: z.string().optional(),
  category: z.enum(['SOCIAL', 'BANK', 'WORK', 'SHOPPING', 'EDUCATION', 'CUSTOM'])
});

export type VaultFormValues = z.infer<typeof vaultFormSchema>;

const defaultValues: VaultFormValues = {
  website: '',
  username: '',
  email: '',
  password: '',
  notes: '',
  category: 'CUSTOM'
};

export function VaultForm({
  initialValue,
  onSubmit,
  onCancel
}: {
  initialValue?: VaultItem | null;
  onSubmit: (values: VaultFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  // Form state, validation, aur generated password ka control yahan hai.
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<VaultFormValues>({
    resolver: zodResolver(vaultFormSchema),
    defaultValues
  });

  useEffect(() => {
    // Edit mode me existing vault item ko form me preload kar dete hain.
    if (!initialValue) {
      return;
    }

    setValue('website', initialValue.website);
    setValue('username', initialValue.username);
    setValue('email', initialValue.email);
    setValue('notes', initialValue.notes ?? '');
    setValue('category', initialValue.category);
  }, [initialValue, setValue]);

  const passwordValue = watch('password');
  const passwordMetrics = getPasswordStrength(passwordValue);

  function fillGeneratedPassword() {
    // Strong random password generate karke field me set karte hain.
    setValue('password', generatePassword({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true }));
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Website" error={errors.website?.message}>
          <input {...register('website')} className="field-input" placeholder="example.com" />
        </Field>
        <Field label="Username" error={errors.username?.message}>
          <input {...register('username')} className="field-input" placeholder="john_doe" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input {...register('email')} className="field-input" placeholder="john@example.com" />
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <select {...register('category')} className="field-input">
            {(['SOCIAL', 'BANK', 'WORK', 'SHOPPING', 'EDUCATION', 'CUSTOM'] as VaultCategory[]).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Password" error={errors.password?.message}>
        <div className="flex gap-3">
          <input {...register('password')} type="password" className="field-input flex-1" placeholder="Use the generator or type one in" />
          <button type="button" onClick={fillGeneratedPassword} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20">
            Generate
          </button>
        </div>
      </Field>

      <PasswordStrengthMeter label={passwordMetrics.label} entropy={passwordMetrics.entropy} />

      <Field label="Notes" error={errors.notes?.message}>
        <textarea {...register('notes')} className="field-input min-h-28 resize-y" placeholder="Optional notes" />
      </Field>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/5">
          Cancel
        </button>
        <button disabled={isSubmitting} type="submit" className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
          {initialValue ? 'Update Password' : 'Save Password'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}
