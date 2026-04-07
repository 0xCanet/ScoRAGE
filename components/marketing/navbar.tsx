'use client';

import Link from 'next/link';
import { useState } from 'react';

import { navItems } from '@/components/marketing/data';

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar-shell">
      <nav className="navbar container" aria-label="Navigation principale">
        <Link href="/" className="navbar__logo" onClick={() => setOpen(false)}>
          Sco<span>RAGE</span>
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <div id="primary-nav" className={`navbar__panel${open ? ' is-open' : ''}`}>
          <div className="navbar__links">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="navbar__link" onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
          </div>
          <Link href="/request" className="btn-primary btn-primary--sm" onClick={() => setOpen(false)}>
            Scanner un token
          </Link>
        </div>
      </nav>
    </header>
  );
}
