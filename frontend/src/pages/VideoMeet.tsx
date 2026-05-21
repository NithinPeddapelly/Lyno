import { useEffect, useRef, useState, useCallback, CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import Chat from "../components/chat";
import server from "../environment";
import { ChatMessage, VideoStream } from "../types";

const peerConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const silence = (): MediaStreamTrack => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination()) as MediaStreamAudioDestinationNode;
  oscillator.start();
  ctx.resume();
  return Object.assign((dst.stream.getAudioTracks()[0] as MediaStreamTrack), { enabled: false });
};

const blackTrack = ({ width = 640, height = 480 } = {}): MediaStreamTrack => {
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  canvas.getContext("2d")!.fillRect(0, 0, width, height);
  const stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], { enabled: false });
};

export default function VideoMeetComponent() {
  const navigate = useNavigate();
  const { url: meetingCodeParam } = useParams<{ url: string }>();
  const meetingCode = (meetingCodeParam ?? "").trim();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const socketIdRef = useRef<string>("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const connectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const videoRef = useRef<VideoStream[]>([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [notification, setNotification] = useState("");
  const [videos, setVideos] = useState<VideoStream[]>([]);

  const remoteCount = videos.length;
  const remoteColumns = Math.max(1, Math.min(4, remoteCount || 1));

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  }, []);

  // Called once on mount to check permissions and prepare local stream
  useEffect(() => {
    (async () => {
      try {
        const vPerm = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
        const aPerm = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        const hasVideo = !!vPerm;
        const hasAudio = !!aPerm;
        setVideoAvailable(hasVideo);
        setAudioAvailable(hasAudio);
        setVideoOn(hasVideo);
        setAudioOn(hasAudio);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setScreenAvailable(!!(navigator.mediaDevices as any).getDisplayMedia);

        if (hasVideo || hasAudio) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: hasVideo,
            audio: hasAudio,
          });
          window.localStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("Media permission error:", err);
      }
    })();
  }, []); // ← empty dep array: runs once on mount only

  const addMessage = useCallback((data: string, sender: string, socketIdSender: string) => {
    setMessages((prev) => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((n) => n + 1);
    }
  }, []);

  const gotMessageFromServer = useCallback((fromId: string, message: string) => {
    const signal = JSON.parse(message) as { sdp?: RTCSessionDescriptionInit; ice?: RTCIceCandidateInit };
    if (fromId === socketIdRef.current) return;
    const conn = connectionsRef.current[fromId];
    if (!conn) return;

    if (signal.sdp) {
      conn.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        if (signal.sdp!.type === "offer") {
          conn.createAnswer().then((desc) => {
            conn.setLocalDescription(desc).then(() => {
              socketRef.current?.emit("signal", fromId, JSON.stringify({ sdp: conn.localDescription }));
            });
          });
        }
      }).catch(console.error);
    }
    if (signal.ice) {
      conn.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(console.error);
    }
  }, []);

  const getUserMediaSuccess = useCallback((stream: MediaStream) => {
    try { window.localStream?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    window.localStream = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    Object.entries(connectionsRef.current).forEach(([id, conn]) => {
      if (id === socketIdRef.current) return;
      const senders = conn.getSenders();
      ["audio", "video"].forEach((kind) => {
        const nextTrack = stream.getTracks().find((track) => track.kind === kind) ?? null;
        const sender = senders.find((s) => s.track?.kind === kind);
        if (sender) {
          sender.replaceTrack(nextTrack).catch(console.error);
        } else if (nextTrack) {
          conn.addTrack(nextTrack, stream);
        }
      });
      conn.createOffer().then((desc) => {
        conn.setLocalDescription(desc).then(() => {
          socketRef.current?.emit("signal", id, JSON.stringify({ sdp: conn.localDescription }));
        });
      });
    });

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideoOn(false);
        setAudioOn(false);
        const blackSilence = new MediaStream([blackTrack(), silence()]);
        window.localStream = blackSilence;
        if (localVideoRef.current) localVideoRef.current.srcObject = blackSilence;
        Object.entries(connectionsRef.current).forEach(([id, conn]) => {
          const senders = conn.getSenders();
          ["audio", "video"].forEach((kind) => {
            const nextTrack = blackSilence.getTracks().find((next) => next.kind === kind) ?? null;
            const sender = senders.find((s) => s.track?.kind === kind);
            if (sender) {
              sender.replaceTrack(nextTrack).catch(console.error);
            } else if (nextTrack) {
              conn.addTrack(nextTrack, blackSilence);
            }
          });
          conn.createOffer().then((desc) => {
            conn.setLocalDescription(desc).then(() => {
              socketRef.current?.emit("signal", id, JSON.stringify({ sdp: conn.localDescription }));
            });
          });
        });
      };
    });
  }, []);

  const getUserMedia = useCallback((video: boolean, audio: boolean) => {
    if (video || audio) {
      navigator.mediaDevices.getUserMedia({ video, audio }).then(getUserMediaSuccess).catch(console.error);
    } else {
      try { localVideoRef.current?.srcObject && (localVideoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    }
  }, [getUserMediaSuccess]);

  const connectToSocketServer = useCallback(() => {
    if (!server) {
      showNotification("Backend URL is missing. Set VITE_SERVER_URL and redeploy.");
      return;
    }

    const socket = io(server, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      timeout: 10000,
    }) as Socket;
    socketRef.current = socket;

    socket.on("signal", gotMessageFromServer);
    socket.on("connect", () => {
      socket.emit("join-call", meetingCode || window.location.pathname);
      socketIdRef.current = socket.id ?? "";
      socket.on("chat-message", addMessage);
      socket.on("user-left", (id: string) => {
        setVideos((prev) => prev.filter((v) => v.socketId !== id));
      });
      socket.on("user-joined", (id: string, clients: string[]) => {
        clients.forEach((clientId) => {
          if (connectionsRef.current[clientId]) return;
          const conn = new RTCPeerConnection(peerConfig);
          connectionsRef.current[clientId] = conn;

          conn.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("signal", clientId, JSON.stringify({ ice: event.candidate }));
            }
          };

          conn.ontrack = (event) => {
            const stream = event.streams?.[0];
            if (!stream) return;
            setVideos((prev) => {
              const exists = prev.find((v) => v.socketId === clientId);
              const entry: VideoStream = { socketId: clientId, stream, autoplay: true, playsinline: true };
              const updated = exists
                ? prev.map((v) => (v.socketId === clientId ? entry : v))
                : [...prev, entry];
              videoRef.current = updated;
              return updated;
            });
          };

          const stream = window.localStream ?? new MediaStream([blackTrack(), silence()]);
          stream.getTracks().forEach((track) => {
            conn.addTrack(track, stream);
          });
        });

        if (id === socketIdRef.current) {
          Object.entries(connectionsRef.current).forEach(([id2, conn]) => {
            if (id2 === socketIdRef.current) return;
            try {
              window.localStream?.getTracks().forEach((track) => {
                const sender = conn.getSenders().find((s) => s.track?.kind === track.kind);
                if (!sender) conn.addTrack(track, window.localStream);
              });
            } catch { /* ignore */ }
            conn.createOffer().then((desc) => {
              conn.setLocalDescription(desc).then(() => {
                socket.emit("signal", id2, JSON.stringify({ sdp: conn.localDescription }));
              });
            });
          });
        }
      });
    });
  }, [gotMessageFromServer, addMessage, meetingCode, showNotification]);

  const handleGetMedia = () => {
    setAskForUsername(false);
    getUserMedia(videoAvailable, audioAvailable);
    connectToSocketServer();
  };

  const handleVideo = () => {
    const next = !videoOn;
    setVideoOn(next);
    showNotification(next ? "Camera on" : "Camera off");
    getUserMedia(next, audioOn);
  };

  const handleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    showNotification(next ? "Microphone on" : "Microphone off");
    getUserMedia(videoOn, next);
  };

  const handleScreen = () => {
    if (!screenOn) {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
        window.localStream?.getTracks().forEach((t) => t.stop());
        window.localStream = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        Object.entries(connectionsRef.current).forEach(([id, conn]) => {
          if (id === socketIdRef.current) return;
          const senders = conn.getSenders();
          ["audio", "video"].forEach((kind) => {
            const nextTrack = stream.getTracks().find((track) => track.kind === kind) ?? null;
            const sender = senders.find((s) => s.track?.kind === kind);
            if (sender) {
              sender.replaceTrack(nextTrack).catch(console.error);
            } else if (nextTrack) {
              conn.addTrack(nextTrack, stream);
            }
          });
          conn.createOffer().then((desc) => {
            conn.setLocalDescription(desc).then(() => {
              socketRef.current?.emit("signal", id, JSON.stringify({ sdp: conn.localDescription }));
            });
          });
        });
        stream.getTracks().forEach((t) => {
          t.onended = () => {
            setScreenOn(false);
            getUserMedia(videoOn, audioOn);
          };
        });
        setScreenOn(true);
      }).catch(console.error);
    } else {
      setScreenOn(false);
      getUserMedia(videoOn, audioOn);
    }
  };

  const handleEndCall = () => {
    try { (localVideoRef.current?.srcObject as MediaStream)?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    socketRef.current?.disconnect();
    showNotification("Call ended");
    navigate("/home");
  };

  const handleSendMessage = (msg: string) => {
    socketRef.current?.emit("chat-message", msg, username);
  };

  return (
    <div className="vm-root">
      {askForUsername ? (
        <div className="vm-lobby">
          <div className="vm-lobby-card">
            <div className="vm-lobby-logo">
              <span className="vm-logo-dot" />
              Lyno
            </div>
            <h2 className="vm-lobby-title">Ready to join?</h2>
            <p className="vm-lobby-sub">Enter your display name to continue</p>
            <div className="vm-lobby-preview">
              <video ref={localVideoRef} autoPlay muted playsInline className="vm-local-preview" />
              {!videoAvailable && (
                <div className="vm-no-video">📷 Camera unavailable</div>
              )}
            </div>
            <TextField
              fullWidth
              label="Your name"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && username.trim() && handleGetMedia()}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#6c63ff" },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              disabled={!username.trim()}
              onClick={handleGetMedia}
              sx={{
                mt: 1.5,
                background: "#6c63ff",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "0.75rem",
                "&:hover": { background: "#574bff" },
                "&:disabled": { opacity: 0.5 },
              }}
            >
              Join Meeting →
            </Button>
          </div>
        </div>
      ) : (
        <div className="vm-meet">
          {/* Remote videos */}
          <div className="vm-conference" style={{ "--vm-cols": String(remoteColumns) } as CSSProperties}>
            {videos.map((v) => (
              <div key={v.socketId} className="vm-remote-wrap">
                <video
                  className="vm-remote-video"
                  autoPlay
                  playsInline
                  ref={(ref) => { if (ref && v.stream) ref.srcObject = v.stream; }}
                />
              </div>
            ))}
            {videos.length === 0 && (
              <div className="vm-waiting">Waiting for others to join…</div>
            )}
          </div>

          {/* Chat panel */}
          {showChat && (
            <Chat
              messages={messages}
              sendMessage={handleSendMessage}
              newMessages={newMessages}
              setNewMessages={setNewMessages}
              username={username}
            />
          )}

          {/* Notification toast */}
          {notification && (
            <div className="vm-notification">{notification}</div>
          )}

          {/* Local video PIP */}
          <video className="vm-local-pip" ref={localVideoRef} autoPlay muted playsInline />

          {/* Controls */}
          <div className="vm-controls">
            <IconButton onClick={handleVideo} sx={{ color: videoOn ? "white" : "#ef4444" }}>
              {videoOn ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleAudio} sx={{ color: audioOn ? "white" : "#ef4444" }}>
              {audioOn ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable && (
              <IconButton onClick={handleScreen} sx={{ color: screenOn ? "#22c55e" : "white" }}>
                {screenOn ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton>
            )}
            <Badge badgeContent={newMessages} color="error" max={99}>
              <IconButton onClick={() => { setShowChat(!showChat); setNewMessages(0); }} sx={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
            <IconButton
              onClick={handleEndCall}
              sx={{ background: "#ef4444", color: "white", "&:hover": { background: "#dc2626" } }}
            >
              <CallEndIcon />
            </IconButton>
          </div>
        </div>
      )}

      <style>{`
        .vm-root { min-height: 100vh; background: #050508; color: white; }

        /* LOBBY */
        .vm-lobby {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(108,99,255,0.1) 0%, transparent 70%);
        }
        .vm-lobby-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .vm-lobby-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.3rem;
          font-weight: 700;
          justify-content: center;
        }
        .vm-logo-dot {
          width: 8px; height: 8px;
          background: #6c63ff;
          border-radius: 50%;
          box-shadow: 0 0 8px #6c63ff;
        }
        .vm-lobby-title {
          font-size: 1.4rem;
          font-weight: 700;
          text-align: center;
        }
        .vm-lobby-sub {
          text-align: center;
          color: rgba(255,255,255,0.5);
          font-size: 0.9rem;
          margin-top: -0.75rem;
        }
        .vm-lobby-preview {
          position: relative;
          background: #0a0a0f;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16/9;
        }
        .vm-local-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .vm-no-video {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.4);
          font-size: 0.9rem;
        }

        /* MEET */
        .vm-meet {
          position: relative;
          width: 100vw;
          height: 100vh;
          background: #050508;
          overflow: hidden;
        }
        .vm-conference {
          width: 100%;
          height: calc(100vh - 80px);
          display: grid;
          grid-template-columns: repeat(var(--vm-cols), minmax(0, 1fr));
          grid-auto-rows: 1fr;
          align-content: start;
          gap: 12px;
          padding: 16px;
        }
        .vm-remote-wrap {
          background: #0d0d14;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          width: 100%;
          aspect-ratio: 16 / 9;
          min-height: 180px;
        }
        .vm-remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .vm-waiting {
          color: rgba(255,255,255,0.3);
          font-size: 1rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .vm-local-pip {
          position: absolute;
          bottom: 100px;
          left: 16px;
          width: 180px;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          border: 2px solid #6c63ff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          z-index: 10;
        }
        .vm-notification {
          position: fixed;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 0.6rem 1.25rem;
          border-radius: 100px;
          font-size: 0.875rem;
          border: 1px solid rgba(255,255,255,0.1);
          z-index: 100;
          pointer-events: none;
        }
        .vm-controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          align-items: center;
          background: rgba(0,0,0,0.7);
          padding: 10px 20px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.08);
          z-index: 20;
        }
        .vm-controls .MuiIconButton-root { transition: transform 0.2s; }
        .vm-controls .MuiIconButton-root:hover { transform: scale(1.1); }

        @media (max-width: 640px) {
          .vm-conference {
            grid-template-columns: 1fr;
          }
          .vm-local-pip { width: 100px; height: 70px; bottom: 90px; }
        }
      `}</style>
    </div>
  );
}

// Augment window for local media stream
declare global {
  interface Window {
    localStream: MediaStream;
  }
}
