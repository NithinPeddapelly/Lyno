import { useState, useContext, FormEvent } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type FormTab = "login" | "register";

export default function Authentication() {
  const [tab, setTab] = useState<FormTab>("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (tab === "login") {
        await handleLogin(username, password);
      } else {
        const msg = await handleRegister(name, username, password);
        setSuccess(msg);
        setName("");
        setUsername("");
        setPassword("");
        setTab("login");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-bg-glow" />
      <div className="auth-card">
        {/* Logo */}
        <button className="auth-back" onClick={() => navigate("/")}>← Back</button>
        <div className="auth-logo">
          <span className="auth-logo-dot" />
          Lyno
        </div>
        <p className="auth-tagline">
          {tab === "login" ? "Welcome back 👋" : "Create your account"}
        </p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {tab === "register" && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="auth-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jane_doe"
              required
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={tab === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}
          {success && <div className="auth-success">✓ {success}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : tab === "login"
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        <p className="auth-footer-text">
          © {new Date().getFullYear()} Lyno
        </p>
      </div>

      <style>{`
        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-dark);
          position: relative;
          padding: 2rem;
        }
        .auth-bg-glow {
          position: fixed;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 2.5rem 2rem;
          box-shadow: var(--shadow-card);
        }
        .auth-back {
          position: absolute;
          top: 1.25rem;
          left: 1.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.875rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .auth-back:hover { color: var(--text-primary); }
        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        .auth-logo-dot {
          width: 10px; height: 10px;
          background: var(--brand);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--brand);
        }
        .auth-tagline {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 1.75rem;
        }
        .auth-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          padding: 3px;
          margin-bottom: 1.75rem;
          border: 1px solid var(--border-glass);
        }
        .auth-tab {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .auth-tab.active {
          background: var(--brand);
          color: white;
          box-shadow: 0 2px 10px rgba(108,99,255,0.4);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .auth-field label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .auth-field input {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.2s;
          outline: none;
        }
        .auth-field input::placeholder { color: var(--text-muted); }
        .auth-field input:focus { border-color: var(--brand); }
        .auth-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
        }
        .auth-success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          color: #86efac;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
        }
        .auth-submit {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.85rem;
          background: var(--brand);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(108,99,255,0.35);
        }
        .auth-submit:hover:not(:disabled) {
          background: var(--brand-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(108,99,255,0.5);
        }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .auth-footer-text {
          text-align: center;
          color: rgba(255,255,255,0.78);
          font-size: 1rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}
