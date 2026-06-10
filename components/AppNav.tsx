export function AppNav() {
  return (
    <nav className="nav">
      <a className="brand" href="/social/accounts" aria-label="Korvex home">
        <span className="brand-orb" />
        <span>Korvex Command OS</span>
      </a>
      <div className="nav-links">
        <a href="/social/accounts">Connected Accounts</a>
        <a href="/prompt-library">Prompt Library</a>
        <a href="/schedule">Schedule</a>
        <a href="/growth-coach">Growth Coach</a>
        <a href="/settings">Settings</a>
      </div>
    </nav>
  );
}
