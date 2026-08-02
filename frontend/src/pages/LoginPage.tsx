import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { forgotPasswordRequest, resetPasswordRequest } from '../services/authService';

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(12, 'Password must be at least 12 characters')
});

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email')
});

const resetSchema = z.object({
  email: z.string().email('Enter a valid email'),
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(12, 'Password must be at least 12 characters')
});

type AuthFormValues = z.infer<typeof authSchema>;
type ForgotFormValues = z.infer<typeof forgotSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export function LoginPage() {
  // Login, register, forgot, aur reset ko ek hi screen me manage kiya gaya hai.
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { register: formRegister, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl place-items-center px-6 py-20">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">VaultX Access</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Forgot password' : 'Reset password'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setMode(mode === 'login' ? 'register' : 'login');
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {/* Quick mode switches testing aur workflow dono ko easy banate hain. */}
          <button type="button" onClick={() => { setMode('login'); setResetToken(null); }} className="rounded-full border border-white/10 px-3 py-1 text-slate-300">Login</button>
          <button type="button" onClick={() => { setMode('register'); setResetToken(null); }} className="rounded-full border border-white/10 px-3 py-1 text-slate-300">Register</button>
          <button type="button" onClick={() => setMode('forgot')} className="rounded-full border border-white/10 px-3 py-1 text-slate-300">Forgot</button>
          <button type="button" onClick={() => setMode('reset')} className="rounded-full border border-white/10 px-3 py-1 text-slate-300">Reset</button>
        </div>

        {mode === 'forgot' ? (
          // Forgot password flow me temporary token generate hota hai.
          <ForgotPasswordForm
            onSubmit={async (values) => {
              setErrorMessage(null);

              try {
                const result = await forgotPasswordRequest(values.email);
                setResetToken(result.resetToken ?? null);
                if (result.resetToken) {
                  setMode('reset');
                }
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Password reset failed');
              }
            }}
            errorMessage={errorMessage}
            onBack={() => setMode('login')}
          />
        ) : mode === 'reset' ? (
          // Reset screen me email, token aur new password validate hota hai.
          <ResetPasswordForm
            defaultResetToken={resetToken ?? undefined}
            onSubmit={async (values) => {
              setErrorMessage(null);

              try {
                await resetPasswordRequest(values);
                setMode('login');
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Password reset failed');
              }
            }}
            errorMessage={errorMessage}
            onBack={() => setMode('login')}
          />
        ) : (
          // Normal login/register form yahan render hota hai.
          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit(async (values) => {
              setErrorMessage(null);

              try {
                if (mode === 'register') {
                  await register(values.name ?? '', values.email, values.password);
                } else {
                  await login(values.email, values.password);
                }

                navigate('/dashboard');
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
              }
            })}
          >
            {mode === 'register' ? (
            <Field label="Name" error={errors.name?.message}>
              <input {...formRegister('name')} className="field-input" placeholder="Your name" />
            </Field>
          ) : null}

          <Field label="Email" error={errors.email?.message}>
            <input {...formRegister('email')} className="field-input" placeholder="you@example.com" />
          </Field>

          <Field label="Master Password" error={errors.password?.message}>
            <input {...formRegister('password')} type="password" className="field-input" placeholder="At least 12 characters" />
          </Field>

            {errorMessage ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{errorMessage}</p> : null}

            <button disabled={isSubmitting} type="submit" className="w-full rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        )}

        {mode === 'forgot' && resetToken ? (
          <p className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
            Reset token generated for development: <span className="break-all font-mono">{resetToken}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ForgotPasswordForm({ onSubmit, errorMessage, onBack }: { onSubmit: (values: ForgotFormValues) => Promise<void>; errorMessage: string | null; onBack: () => void }) {
  // Sirf email lene wala lightweight form.
  const { register: formRegister, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Email" error={errors.email?.message}>
        <input {...formRegister('email')} className="field-input" placeholder="you@example.com" />
      </Field>
      {errorMessage ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{errorMessage}</p> : null}
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Back</button>
        <button disabled={isSubmitting} type="submit" className="w-full rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">Send Reset Token</button>
      </div>
    </form>
  );
}

function ResetPasswordForm({ onSubmit, errorMessage, onBack, defaultResetToken }: { onSubmit: (values: ResetFormValues) => Promise<void>; errorMessage: string | null; onBack: () => void; defaultResetToken?: string }) {
  // Reset token aur naya password collect karne wala form.
  const { register: formRegister, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '', resetToken: defaultResetToken ?? '', newPassword: '' }
  });

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Email" error={errors.email?.message}>
        <input {...formRegister('email')} className="field-input" placeholder="you@example.com" />
      </Field>
      <Field label="Reset Token" error={errors.resetToken?.message}>
        <input {...formRegister('resetToken')} className="field-input font-mono" placeholder="Paste reset token" />
      </Field>
      <Field label="New Password" error={errors.newPassword?.message}>
        <input {...formRegister('newPassword')} type="password" className="field-input" placeholder="New master password" />
      </Field>
      {errorMessage ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{errorMessage}</p> : null}
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Back</button>
        <button disabled={isSubmitting} type="submit" className="w-full rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">Reset Password</button>
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
