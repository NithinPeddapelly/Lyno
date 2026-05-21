import { Link } from 'react-router-dom';

const publicRoutes = [
  { label: 'Home', to: '/' },
  { label: 'Sign In / Sign Up', to: '/auth' },
  { label: 'Site Map', to: '/site-map' },
];

const appRoutes = [
  { label: 'Start a Meeting', to: '/home' },
  { label: 'Meeting History', to: '/history' },
  { label: 'Join a Meeting', to: '/Guest-User' },
];

const sections = [
  { label: 'Hero', href: '/#hero' },
  { label: 'Features', href: '/#features' },
  { label: 'Get Started', href: '/#get-started' },
];

export default function SiteMap() {
  return (
    <div className="site-map-root">
      <main className="site-map-card">
        <p className="site-map-kicker">Lyno</p>
        <h1>Site map</h1>
        <p className="site-map-intro">
          A simple map of the public pages and the main in-app routes.
        </p>

        <section className="site-map-section">
          <h2>Public pages</h2>
          <div className="site-map-links">
            {publicRoutes.map((route) => (
              <Link key={route.to} to={route.to}>
                {route.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="site-map-section">
          <h2>App routes</h2>
          <div className="site-map-links">
            {appRoutes.map((route) => (
              <Link key={route.to} to={route.to}>
                {route.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="site-map-section">
          <h2>Landing sections</h2>
          <div className="site-map-links">
            {sections.map((section) => (
              <a key={section.href} href={section.href}>
                {section.label}
              </a>
            ))}
          </div>
        </section>
      </main>

      <style>{`
        .site-map-root {
          min-height: 100vh;
          padding: 4rem 1.5rem;
          background:
            radial-gradient(circle at top, rgba(80,70,229,0.2), transparent 45%),
            linear-gradient(180deg, #0a0a0f 0%, #090913 100%);
          color: var(--text-primary);
        }
        .site-map-card {
          width: min(760px, 100%);
          margin: 0 auto;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass);
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: var(--shadow-card);
        }
        .site-map-kicker {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--brand-light);
          margin-bottom: 0.75rem;
        }
        .site-map-card h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          margin-bottom: 0.75rem;
        }
        .site-map-intro {
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .site-map-section + .site-map-section {
          margin-top: 1.75rem;
        }
        .site-map-section h2 {
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--text-muted);
          margin-bottom: 0.85rem;
        }
        .site-map-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.85rem;
        }
        .site-map-links a {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 1rem 1.1rem;
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .site-map-links a:hover {
          transform: translateY(-2px);
          border-color: rgba(80,70,229,0.45);
          background: rgba(80,70,229,0.14);
        }
        @media (max-width: 640px) {
          .site-map-root {
            padding: 2rem 1rem;
          }
          .site-map-card {
            padding: 1.5rem;
            border-radius: 22px;
          }
        }
      `}</style>
    </div>
  );
}
