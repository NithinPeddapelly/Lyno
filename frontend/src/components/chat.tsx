import { useState, FormEvent, useRef, useEffect } from "react";
import { ChatMessage } from "../types";

interface ChatProps {
  messages: ChatMessage[];
  sendMessage: (msg: string) => void;
  newMessages: number;
  setNewMessages: (n: number) => void;
  username: string;
}

const Chat = ({ messages, sendMessage, setNewMessages, username }: ChatProps) => {
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage("");
    setNewMessages(0);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>💬 In-call Chat</span>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-empty">No messages yet</p>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender === username;
            return (
              <div key={i} className={`chat-msg-row ${isOwn ? "own" : "other"}`}>
                {!isOwn && <span className="chat-sender">{msg.sender}</span>}
                <div className={`chat-bubble ${isOwn ? "own" : "other"}`}>{msg.data}</div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          className="chat-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message…"
        />
        <button type="submit" className="chat-send-btn">Send</button>
      </form>

      <style>{`
        .chat-panel {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: min(320px, 90vw);
          max-height: 420px;
          background: rgba(15,15,20,0.95);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow-card);
          z-index: 50;
          overflow: hidden;
        }
        .chat-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-glass);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .chat-empty {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-top: 1rem;
        }
        .chat-msg-row {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .chat-msg-row.own { align-items: flex-end; }
        .chat-msg-row.other { align-items: flex-start; }
        .chat-sender {
          font-size: 0.72rem;
          color: var(--text-muted);
          padding-left: 0.25rem;
        }
        .chat-bubble {
          max-width: 85%;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          line-height: 1.5;
          word-break: break-word;
        }
        .chat-bubble.own {
          background: var(--brand);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.other {
          background: rgba(255,255,255,0.08);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }
        .chat-input-row {
          display: flex;
          gap: 0.5rem;
          padding: 0.6rem;
          border-top: 1px solid var(--border-glass);
        }
        .chat-input {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          color: white;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
        }
        .chat-input:focus { border-color: var(--brand); }
        .chat-input::placeholder { color: var(--text-muted); }
        .chat-send-btn {
          background: var(--brand);
          border: none;
          color: white;
          padding: 0.5rem 0.85rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chat-send-btn:hover { background: var(--brand-dark); }
      `}</style>
    </div>
  );
};

export default Chat;
