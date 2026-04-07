import Link from 'next/link';

export function AppTopbar() {
  return (
    <header className="app-topbar">
      <div className="container app-topbar__inner">
        <Link href="/" className="app-topbar__logo">
          Sco<span>RAGE</span>
        </Link>
        <div className="app-topbar__actions">
          <Link href="/dashboard" className="btn-ghost btn-ghost--app">
            Dashboard
          </Link>
          <Link href="/request" className="btn-secondary btn-secondary--sm">
            Nouvelle analyse
          </Link>
        </div>
      </div>
    </header>
  );
}
