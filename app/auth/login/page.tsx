import Link from 'next/link';
import { login } from '../actions';
import { AuthShell } from '@/components/auth/AuthShell';
import { Icon } from '@/components/ui/kx';

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : undefined;
  const message = typeof params.message === 'string' ? params.message : undefined;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your content workspace — your posts, calendar, and analytics are waiting."
      error={error}
      message={message}
    >
      <form action={login}>
        <div className="kx-field">
          <label className="kx-label" htmlFor="login-email">Email</label>
          <input autoComplete="email" className="kx-input" id="login-email" name="email" required type="email" />
        </div>
        <div className="kx-field">
          <label className="kx-label" htmlFor="login-password">Password</label>
          <input autoComplete="current-password" className="kx-input" id="login-password" name="password" required type="password" />
        </div>
        <button className="kx-btn is-block" type="submit">
          <Icon name="login" /> Log in
        </button>
      </form>
      <div className="kx-auth-divider">or</div>
      <Link className="kx-btn is-secondary is-block" href="/auth/demo">
        <Icon name="visibility" /> Try the demo workspace
      </Link>
      <div className="kx-auth-links" style={{ marginTop: 18 }}>
        <span>
          No account? <Link href="/auth/signup">Sign up free</Link>
        </span>
        <Link href="/auth/forgot-password">Forgot password?</Link>
      </div>
    </AuthShell>
  );
}
