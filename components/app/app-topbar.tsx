"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppTopbar() {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';
  const isRequest = pathname === '/request';
  return (
    <header className="app-topbar">
      <div className="container app-topbar__inner">
        <Link href="/" className="app-topbar__logo">
          Sco<span>RAGE</span>
        </Link>
        <div className="app-topbar__actions">
          <Link href="/dashboard" className={`btn-ghost btn-ghost--app ${isDashboard ? 'is-active' : ''}`}>
            Surveillance          </Link>
          <Link href="/request" className={`btn-secondary btn-secondary--sm ${isRequest ? 'is-active' : ''}`}>
            Nouvelle analyse
          </Link>
        </div>
      </div>
    </header>
  );
}
