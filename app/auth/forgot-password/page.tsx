import Link from 'next/link';
import { forgotPassword } from '../actions';
import { AuthShell } from '@/components/auth/AuthShell';
import { Icon } from '@/components/ui/kx';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : undefined;

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to set a new password."
      error={error}
    >
      <form action={forgotPassword}>
        <div className="kx-field">
          <label className="kx-label" htmlFor="forgot-email">Email</label>
          <input autoComplete="email" className="kx-input" id="forgot-email" name="email" required type="email" />
        </div>
        <button className="kx-btn is-block" type="submit">
          <Icon name="mail" /> Send reset link
        </button>
      </form>
      <div className="kx-auth-links">
        <span>
          Remembered it? <Link href="/auth/login">Log in</Link>
        </span>
      </div>
    </AuthShell>
  );
}
