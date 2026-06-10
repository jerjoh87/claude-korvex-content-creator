import Link from 'next/link';
import { signup } from '../actions';
import { AuthShell } from '@/components/auth/AuthShell';
import { Icon } from '@/components/ui/kx';

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : undefined;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your AI content workspace in under a minute. No credit card needed."
      error={error}
    >
      <form action={signup}>
        <div className="kx-field">
          <label className="kx-label" htmlFor="signup-name">Full name</label>
          <input autoComplete="name" className="kx-input" id="signup-name" name="full_name" required type="text" />
        </div>
        <div className="kx-field">
          <label className="kx-label" htmlFor="signup-email">Email</label>
          <input autoComplete="email" className="kx-input" id="signup-email" name="email" required type="email" />
        </div>
        <div className="kx-field">
          <label className="kx-label" htmlFor="signup-password">Password</label>
          <input autoComplete="new-password" className="kx-input" id="signup-password" minLength={8} name="password" required type="password" />
          <p className="kx-help">At least 8 characters.</p>
        </div>
        <button className="kx-btn is-block" type="submit">
          <Icon name="rocket_launch" /> Create account
        </button>
      </form>
      <div className="kx-auth-links">
        <span>
          Already have an account? <Link href="/auth/login">Log in</Link>
        </span>
      </div>
    </AuthShell>
  );
}
