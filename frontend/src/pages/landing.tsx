import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const features = [
  {
    icon: "⚡",
    title: "Ultra-Low Latency",
    desc: "WebRTC-powered calls with sub-100ms latency for truly real-time collaboration.",
  },
  {
    icon: "🔒",
    title: "Secure by Default",
    desc: "End-to-end encrypted sessions, JWT authentication, and secure signaling.",
  },
  {
    icon: "📺",
    title: "Screen Sharing",
    desc: "Share your entire screen or a specific window with a single click.",
  },
  {
    icon: "💬",
    title: "In-Call Chat",
    desc: "Text chat alongside your video — messages sync instantly for all participants.",
  },
  {
    icon: "🌐",
    title: "Cross-Platform",
    desc: "Works on all modern browsers — no downloads, no plugins required.",
  },
  {
    icon: "📱",
    title: "Responsive Design",
    desc: "Optimised for desktop and mobile — meet from anywhere.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-root">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-dot" />
          Lyno
        </div>
        <div className={`landing-navlinks ${menuOpen ? "open" : ""}`}>
          <button
            className="nav-btn-ghost"
            onClick={() => {
              setMenuOpen(false);
              navigate("/auth");
            }}
          >
            Sign In
          </button>
          <button
            className="nav-btn-primary"
            onClick={() => {
              setMenuOpen(false);
              navigate("/auth");
            }}
          >
            Get Started
          </button>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* HERO */}
      <section id="hero" className="hero-section">
        <div className="hero-badge">✨ Real-time video, reimagined</div>
        <h1 className="hero-title">
          Connect <span className="gradient-text">Instantly.</span>
          <br />
          Collaborate <span className="gradient-text">Effortlessly.</span>
        </h1>
        <p className="hero-subtitle">
          Lyno delivers crystal-clear video calls powered by WebRTC — fast, secure,
          and built for the modern web.
        </p>
        <div className="hero-cta">
          <Link to="/auth" className="btn-primary-lg">
            Start a Meeting →
          </Link>
          <button
            className="btn-ghost-lg"
            onClick={() => navigate("Guest-User")}
          >
            Join as Guest
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">{"<"}100ms</span>
            <span className="stat-label">Latency</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">E2E</span>
            <span className="stat-label">Encrypted</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Downloads needed</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <h2 className="section-title">Everything you need to meet</h2>
        <p className="section-subtitle">
          Powerful features, zero complexity.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section id="get-started" className="cta-banner">
        <h2>Ready to Lyno?</h2>
        <p>Create your free account and start your first meeting in seconds.</p>
        <Link to="/auth" className="btn-primary-lg">
          Get Started — it's free
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Lyno</span>
        <a
          href="https://www.linkedin.com/in/nithinpeddapelly"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn, opens in a new tab"
          title="Opens in a new tab"
        >
          LinkedIn
        </a>
        <a href="/site-map">Site map</a>
        <a href="mailto:nithinpeddapelly@gmail.com">Contact</a>
      </footer>

      <style>{`
        .landing-root {
          min-height: 100vh;
          background: var(--bg-dark);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        /* NAV */
        .landing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10,10,15,0.96);
          border-bottom: 1px solid var(--border-glass);
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .logo-dot {
          width: 10px;
          height: 10px;
          background: var(--brand);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--brand);
        }
        .landing-navlinks {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-btn-ghost {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-btn-ghost:hover { color: white; border-color: rgba(255,255,255,0.3); }
        .nav-btn-primary {
          background: var(--brand);
          border: none;
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .nav-btn-primary:hover { background: var(--brand-dark); transform: translateY(-1px); }
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s;
        }

        /* HERO */
        .hero-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 5rem 2rem 4rem;
          position: relative;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,99,255,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.3);
          color: var(--brand-light);
          padding: 0.35rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
          max-width: 800px;
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--brand) 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          max-width: 560px;
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .hero-cta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 3rem;
        }
        .btn-primary-lg {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--brand);
          color: white;
          padding: 0.85rem 2rem;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(108,99,255,0.4);
        }
        .btn-primary-lg:hover { background: var(--brand-dark); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(108,99,255,0.5); }
        .btn-ghost-lg {
          display: inline-flex;
          align-items: center;
          background: transparent;
          color: var(--text-secondary);
          padding: 0.85rem 2rem;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: 500;
          border: 1px solid var(--border-glass);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost-lg:hover { color: white; border-color: rgba(255,255,255,0.3); background: var(--bg-card); }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .stat { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
        .stat-value { font-size: 1.4rem; font-weight: 700; color: white; }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-divider { width: 1px; height: 40px; background: var(--border-glass); }

        /* FEATURES */
        .features-section {
          padding: 5rem 2rem;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }
        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.05rem;
          margin-bottom: 3rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          text-align: left;
          transition: all 0.25s;
          cursor: default;
        }
        .feature-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(108,99,255,0.3);
          transform: translateY(-3px);
          box-shadow: var(--shadow-card);
        }
        .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
        .feature-title { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.5rem; }
        .feature-desc { font-size: 1rem; color: var(--text-secondary); line-height: 1.6; }

        /* CTA BANNER */
        .cta-banner {
          margin: 2rem auto;
          max-width: 700px;
          background: linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(167,139,250,0.1) 100%);
          border: 1px solid rgba(108,99,255,0.3);
          border-radius: var(--radius-lg);
          padding: 3.5rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .cta-banner h2 { font-size: 2rem; font-weight: 700; }
        .cta-banner p { color: var(--text-secondary); font-size: 1rem; }

        /* FOOTER */
        .landing-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          color: rgba(255,255,255,0.78);
          font-size: 1rem;
          border-top: 1px solid var(--border-glass);
          margin-top: 4rem;
        }
        .landing-footer a { color: rgba(255,255,255,0.88); transition: color 0.2s; }
        .landing-footer a:hover { color: white; }

        @media (max-width: 640px) {
          .landing-navlinks { display: none; }
          .landing-navlinks.open {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 68px;
            left: 0; right: 0;
            background: rgba(10,10,15,0.98);
            border-bottom: 1px solid var(--border-glass);
            padding: 1rem 2rem;
          }
          .feature-desc { font-size: 1rem; }
          .hamburger { display: flex; }
          .hero-stats { flex-wrap: wrap; gap: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
