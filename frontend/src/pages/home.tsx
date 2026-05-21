import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const { logout, userData } = useContext(AuthContext);
  const [meetingCode, setMeetingCode] = useState("");
  const [newCode] = useState(() => Math.random().toString(36).substring(2, 10));
  const [copied, setCopied] = useState(false);

  const { addToUserHistory } = useContext(AuthContext);

  const handleJoin = async () => {
    const code = meetingCode.trim();
    if (!code) return;
    await addToUserHistory(code);
    navigate(`/${code}`);
  };

  const handleCreate = async () => {
    await addToUserHistory(newCode);
    navigate(`/${newCode}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${newCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = userData?.name
    ? userData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="home-root">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-logo">
          <span className="home-logo-dot" />
          Lyno
        </div>
        <div className="home-nav-right">
          <button className="home-nav-link" onClick={() => navigate("/history")}>
            History
          </button>
          <div className="home-avatar">{initials}</div>
          <button className="home-logout-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="home-main">
        <div className="home-greeting">
          <h1>
            Good to see you{userData?.name ? `, ${userData.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p>Start a new meeting or join an existing one.</p>
        </div>

        <div className="home-cards">
          {/* Create card */}
          <div className="home-card">
            <div className="card-icon">🎥</div>
            <h2>New Meeting</h2>
            <p>Start an instant meeting and share the link with others.</p>
            <div className="invite-link-box">
              <span className="invite-link-text">
                {window.location.origin}/{newCode}
              </span>
              <button className="invite-copy-btn" onClick={handleCopy}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <button className="btn-card-primary" onClick={handleCreate}>
              Start Meeting →
            </button>
          </div>

          {/* Join card */}
          <div className="home-card">
            <div className="card-icon">🔗</div>
            <h2>Join Meeting</h2>
            <p>Enter a Lyno Key shared by the meeting host.</p>
            <input
              className="home-input"
              placeholder="Enter Lyno Key"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <button
              className="btn-card-secondary"
              onClick={handleJoin}
              disabled={!meetingCode.trim()}
            >
              Join →
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .home-root {
          min-height: 100vh;
          background: var(--bg-dark);
          color: var(--text-primary);
        }
        .home-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(10,10,15,0.96);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .home-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.4rem;
          font-weight: 700;
        }
        .home-logo-dot {
          width: 9px; height: 9px;
          background: var(--brand);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--brand);
        }
        .home-nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .home-nav-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .home-nav-link:hover { color: white; }
        .home-avatar {
          width: 34px; height: 34px;
          background: var(--brand);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .home-logout-btn {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 0.4rem 0.9rem;
          border-radius: 7px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .home-logout-btn:hover { color: white; border-color: rgba(255,255,255,0.25); }
        .home-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }
        .home-greeting {
          margin-bottom: 3rem;
        }
        .home-greeting h1 {
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .home-greeting p {
          color: var(--text-secondary);
          font-size: 1rem;
        }
        .home-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .home-card {
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .home-card:hover {
          border-color: rgba(108,99,255,0.3);
          box-shadow: var(--shadow-card);
        }
        .card-icon { font-size: 2.2rem; }
        .home-card h2 { font-size: 1.2rem; font-weight: 600; }
        .home-card p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }
        .invite-link-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 0.6rem 0.75rem;
        }
        .invite-link-text {
          flex: 1;
          font-size: 0.8rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .invite-copy-btn {
          background: none;
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 0.25rem 0.6rem;
          border-radius: 5px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .invite-copy-btn:hover { color: white; border-color: rgba(255,255,255,0.3); }
        .home-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .home-input::placeholder { color: var(--text-muted); }
        .home-input:focus { border-color: var(--brand); }
        .btn-card-primary {
          margin-top: auto;
          padding: 0.75rem 1.5rem;
          background: var(--brand);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 3px 12px rgba(108,99,255,0.35);
        }
        .btn-card-primary:hover { background: var(--brand-dark); transform: translateY(-1px); }
        .btn-card-secondary {
          margin-top: auto;
          padding: 0.75rem 1.5rem;
          background: transparent;
          color: var(--brand-light);
          border: 1px solid rgba(108,99,255,0.4);
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-card-secondary:hover:not(:disabled) { background: rgba(108,99,255,0.1); }
        .btn-card-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default withAuth(HomeComponent);
