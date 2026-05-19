import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, User, Eye, EyeOff,
  ArrowRight, AlertCircle, Loader2,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

/* ── Google icon ──────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.5 7.3-17.3z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.2 1.5-5 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.6 42.7 14.7 48 24 48z" />
      <path fill="#FBBC04" d="M10.8 28.8A14.4 14.4 0 0 1 10 24c0-1.7.3-3.3.8-4.8v-6.2H2.6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l8.2-6z" />
      <path fill="#E94235" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.4 30.5 0 24 0 14.7 0 6.6 5.3 2.6 13.2l8.2 6.2C12.7 13.6 17.9 9.5 24 9.5z" />
    </svg>
  );
}

type Mode = 'login' | 'register';

interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  icon: React.ReactNode;
  trailingSlot?: React.ReactNode;
  disabled?: boolean;
}

function Field({ id, label, type, value, onChange, placeholder, autoComplete, icon, trailingSlot, disabled }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-medium text-sm"
        style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#4d4c48' }}
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#87867f' }}>
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-3 border rounded-md text-base focus:outline-none transition-all duration-200 disabled:opacity-50"
          style={{
            fontFamily: 'Libre Franklin, Arial, sans-serif',
            backgroundColor: '#faf9f5',
            borderColor: '#f0eee6',
            color: '#1b1c18',
            fontSize: '15px',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#3b6840';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 104, 64, 0.12)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#f0eee6';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {trailingSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailingSlot}
          </span>
        )}
      </div>
    </div>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode: Mode = location.pathname.includes('register') ? 'register' : 'login';
  const [mode, setMode] = useState<Mode>(initialMode);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setDisplayName('');
    setPassword('');
  }

  function friendlyError(code: string): string {
    const map: Record<string, string> = {
      'auth/user-not-found': 'No account found with that email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/email-already-in-use': 'An account already exists with that email.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/network-request-failed': 'Network error. Check your connection and try again.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) await updateProfile(user, { displayName: displayName.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/book', { replace: true });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (googleLoading) return;
    setError('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/book', { replace: true });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(friendlyError(code));
    } finally {
      setGoogleLoading(false);
    }
  }

  const busy = loading || googleLoading;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#fbf9f2' }}>

      {/* ── Left decorative panel (desktop only) ─────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden"
        style={{ backgroundColor: '#efeee7', padding: '48px' }}
      >
        {/* Brand */}
        <Link
          to="/"
          className="italic font-medium text-3xl transition-opacity hover:opacity-75"
          style={{ fontFamily: 'Literata, Georgia, serif', color: '#3b6840' }}
        >
          Heirloom Kitchen
        </Link>

        {/* Center editorial content */}
        <div className="flex flex-col gap-8">
          <div
            className="rounded-2xl overflow-hidden ring-shadow"
            style={{ backgroundColor: '#e3e3dc', padding: '40px' }}
          >
            <div
              className="italic mb-4"
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: '28px',
                fontWeight: 500,
                lineHeight: 1.3,
                color: '#1b1c18',
              }}
            >
              "A recipe is a story that ends in a meal."
            </div>
            <div
              className="uppercase tracking-widest"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 500,
                color: '#87867f',
                letterSpacing: '0.1em',
              }}
            >
              The Heirloom Philosophy
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Recipes Saved', value: '12,000+', bg: '#e8e6dc' },
              { label: 'Families', value: '3,500+', bg: '#faf9f5' },
            ].map(({ label, value, bg }) => (
              <div
                key={label}
                className="rounded-xl ring-shadow p-5"
                style={{ backgroundColor: bg }}
              >
                <div
                  className="text-2xl font-medium mb-1"
                  style={{ fontFamily: 'Literata, Georgia, serif', color: '#3b6840' }}
                >
                  {value}
                </div>
                <div
                  className="uppercase tracking-wider"
                  style={{
                    fontFamily: 'Libre Franklin, Arial, sans-serif',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#87867f',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom caption */}
        <p
          className="text-sm"
          style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
        >
          Your culinary legacy, beautifully preserved.
        </p>

        {/* Decorative circle */}
        <div
          className="absolute -bottom-24 -left-24 rounded-full opacity-30"
          style={{ width: '400px', height: '400px', backgroundColor: '#94c595' }}
        />
      </div>

      {/* ── Right: Form ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">

          {/* Brand (mobile only) */}
          <Link
            to="/"
            className="lg:hidden flex items-center justify-center gap-2.5 mb-10"
          >
            <span
              className="italic font-medium text-2xl"
              style={{ fontFamily: 'Literata, Georgia, serif', color: '#3b6840' }}
            >
              Heirloom Kitchen
            </span>
          </Link>

          {/* Card */}
          <div
            className="rounded-2xl overflow-hidden ring-shadow whisper-shadow"
            style={{ backgroundColor: '#faf9f5' }}
          >
            {/* Tab switcher */}
            <div className="flex border-b" style={{ borderColor: '#f0eee6' }}>
              {(['login', 'register'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  disabled={busy}
                  className="flex-1 py-4 text-sm font-medium transition-colors"
                  style={{
                    fontFamily: 'Libre Franklin, Arial, sans-serif',
                    color: mode === m ? '#1b1c18' : '#87867f',
                    borderBottom: mode === m ? '2px solid #3b6840' : '2px solid transparent',
                    marginBottom: mode === m ? '-1px' : '0',
                    backgroundColor: '#faf9f5',
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="px-8 py-8 flex flex-col gap-6">
              {/* Heading */}
              <div>
                <h1
                  className="mb-1"
                  style={{
                    fontFamily: 'Literata, Georgia, serif',
                    fontSize: '26px',
                    fontWeight: 500,
                    lineHeight: 1.2,
                    color: '#1b1c18',
                  }}
                >
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p
                  className="text-sm"
                  style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#5e5d59' }}
                >
                  {mode === 'login'
                    ? 'Sign in to access your recipe book.'
                    : 'Start building your personal recipe library.'}
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'Libre Franklin, Arial, sans-serif',
                  backgroundColor: '#fbf9f2',
                  borderColor: '#f0eee6',
                  color: '#1b1c18',
                }}
              >
                {googleLoading ? <Loader2 size={18} className="animate-spin" style={{ color: '#87867f' }} /> : <GoogleIcon />}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: '#f0eee6' }} />
                <span
                  className="text-xs"
                  style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
                >
                  or
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#f0eee6' }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {mode === 'register' && (
                  <Field
                    id="display-name"
                    label="Full name"
                    type="text"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    icon={<User size={16} />}
                    disabled={busy}
                  />
                )}
                <Field
                  id="email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  icon={<Mail size={16} />}
                  disabled={busy}
                />
                <Field
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  icon={<Lock size={16} />}
                  disabled={busy}
                  trailingSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ color: '#87867f' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                {error && (
                  <div
                    className="flex items-start gap-2.5 px-4 py-3 rounded-md border"
                    style={{ backgroundColor: 'rgba(186, 26, 26, 0.05)', borderColor: 'rgba(186, 26, 26, 0.2)' }}
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: '#ba1a1a' }} />
                    <p className="text-sm" style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#1b1c18' }}>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || !email || !password}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-md font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ring-shadow"
                  style={{
                    fontFamily: 'Libre Franklin, Arial, sans-serif',
                    backgroundColor: '#94c595',
                    color: '#26522d',
                  }}
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p
                className="text-center text-sm"
                style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
              >
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="font-medium transition-colors"
                  style={{ color: '#3b6840' }}
                >
                  {mode === 'login' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

          {/* Back link */}
          <p
            className="text-center mt-6 text-sm"
            style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
          >
            <Link to="/" className="transition-colors hover:opacity-70">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
