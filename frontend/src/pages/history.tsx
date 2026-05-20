import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Meeting } from "../types";
import withAuth from "../utils/withAuth";

function History() {
  const { getHistoryOfUser, addToUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        setLoadError("Unable to load history. Please sign in again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [getHistoryOfUser]);

  const rejoin = async (code: string) => {
    await addToUserHistory(code);
    navigate(`/${code}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="history-root">
      <nav className="history-nav">
        <button className="history-back" onClick={() => navigate("/home")}>
          ← Back to Home
        </button>
        <div className="history-logo">
          <span className="history-logo-dot" />
          Lyno
        </div>
      </nav>

      <main className="history-main">
        <h1 className="history-heading">Meeting History</h1>
        <p className="history-sub">Your recent Lyno sessions</p>

        {loading ? (
          <div className="history-empty">Loading…</div>
        ) : loadError ? (
          <div className="history-empty">
            <p>{loadError}</p>
            <button className="btn-go-home" onClick={() => navigate("/auth")}>Go to Sign In</button>
          </div>
        ) : meetings.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">📋</div>
            <p>No meetings yet. Start one from the home page!</p>
            <button className="btn-go-home" onClick={() => navigate("/home")}>
              Go to Home
            </button>
          </div>
        ) : (
          <div className="history-list">
            {meetings.map((m) => (
              <div className="history-card" key={m._id}>
                <div className="hcard-info">
                  <span className="hcard-code">{m.meetingCode}</span>
                  <span className="hcard-date">{formatDate(m.date)}</span>
                </div>
                <button className="hcard-rejoin" onClick={() => rejoin(m.meetingCode)}>
                  Rejoin
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .history-root {
          min-height: 100vh;
          background: var(--bg-dark);
          color: var(--text-primary);
        }
        .history-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border-glass);
        }
        .history-back {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .history-back:hover { color: white; }
        .history-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.3rem;
          font-weight: 700;
        }
        .history-logo-dot {
          width: 8px; height: 8px;
          background: var(--brand);
          border-radius: 50%;
        }
        .history-main {
          max-width: 860px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }
        .history-heading {
          font-size: clamp(1.6rem, 4vw, 2rem);
          font-weight: 700;
          margin-bottom: 0.4rem;
        }
        .history-sub {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }
        .history-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .history-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius);
          padding: 1rem 1.25rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .history-card:hover {
          border-color: rgba(108,99,255,0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .hcard-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .hcard-code {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          overflow-wrap: anywhere;
        }
        .hcard-date { font-size: 0.8rem; color: var(--text-muted); }
        .hcard-rejoin {
          background: rgba(108,99,255,0.15);
          border: 1px solid rgba(108,99,255,0.3);
          color: var(--brand-light);
          padding: 0.45rem 1rem;
          border-radius: 7px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hcard-rejoin:hover { background: rgba(108,99,255,0.25); color: white; }
        .history-empty {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .btn-go-home {
          margin-top: 1.5rem;
          background: var(--brand);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-go-home:hover { background: var(--brand-dark); }

        @media (max-width: 640px) {
          .history-nav {
            padding: 1rem;
          }
          .history-main {
            padding: 2rem 1rem;
          }
          .history-card {
            grid-template-columns: 1fr;
          }
          .hcard-rejoin {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default withAuth(History);
