'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppTopbar() {
  const pathname = usePathname();

  return (
    <header className="app-topbar">
      <div className="container app-topbar__inner">
        <Link href="/" className="app-topbar__logo">
          Sco<span>RAGE</span>
        </Link>
        <div className="app-topbar__actions">
          <Link
            href="/dashboard"
            className={`btn-ghost btn-ghost--app${pathname === '/dashboard' ? ' is-active' : ''}`}
          >
            Tableau de bord
          </Link>
          <Link href="/request" className="btn-secondary btn-secondary--sm">
            Nouvelle analyse
          </Link>
        </div>
      </div>
    </header>
  );
}
