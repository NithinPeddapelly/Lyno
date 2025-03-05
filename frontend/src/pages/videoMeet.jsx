import React, { useState, useRef, useEffect } from "react";
import { TextField, Button, Typography, Dialog, Card } from "@mui/material";
import "../styles/videoComponent.css";
import { io } from "socket.io-client";



const serverUrl = "http://localhost:8000";

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(null);
  const [audio, setAudio] = useState(null);
  const [screen, setScreen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getuserMediaSuccess = (stream) => {};

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((Stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let connectToSocketServer = () => {
    socketRef.current = io.connect(serverUrl, { secure: false });
  
    socketRef.current.on("Signal", gotMessageFromServer);
  
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
  
      socketIdRef.current = socketRef.current.id; // Stores the socket ID
  
      // Listen for incoming chat messages
      socketRef.current.on("chat-message", addMessage);
  
      // Handle when a user leaves
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });
  
      // Handle when a user joins
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connection[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connection[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("Signal", socketListId, JSON.stringify({"ice":event.candidate}));
            }
          }
          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);
            if (!videoExists) {
            setVideo(videos =>{
              const updatedVideos = videos.map(video =>
                video.socketId === socketListId ? {...video, stream: event.stream} : video
              )
              videoRef.current = updatedVideos;
              return updatedVideos;
            })
            } else{
              let newViedo = {socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              }
              setVideos(viedos=>{
                const updatedVideos = [...viedos, newViedo]; // spread operator to create a new array
                videoRef.current = updatedVideos;
              })

            }
          }
        });
      });
    });
  };
  

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>LOBBY</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <> </>
      )}
    </div>
  );
}
