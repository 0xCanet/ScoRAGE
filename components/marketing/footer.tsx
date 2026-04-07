import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer-shell">
      <div className="container footer-shell__inner">
        <div className="footer-shell__left">
          <span className="footer-shell__logo">Sco<span>RAGE</span></span>
          <span className="footer-shell__copy">© 2026. Tous droits réservés.</span>
        </div>
        <div className="footer-shell__links">
          <Link href="/#">Mentions légales</Link>
          <Link href="/#">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
