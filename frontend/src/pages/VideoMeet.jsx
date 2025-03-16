import React, { useState, useRef, useEffect } from "react";
import { TextField, Button, Badge, IconButton } from "@mui/material";
import styles from "../styles/videoComponent.module.css";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';

const serverUrl = "http://localhost:8000";

var connections = {}; // Object to hold Peer connections for each user

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Configuration for WebRTC peer connections
};

export default function VideoMeetComponent() {
  // Using refs to hold mutable values that do not cause re-renders
  var socketRef = useRef(); // Reference for socket connection
  let socketIdRef = useRef(); // Reference to store the socket ID of the current user
  let localVideoref = useRef(); // Reference for the local video element
  let videoRef = useRef([]); // Reference to hold video elements for remote users

  const [videoAvailable, setVideoAvailable] = useState(true); // Is video available?
  const [audioAvailable, setAudioAvailable] = useState(true); // Is audio available?

  const [video, setVideo] = useState(true); // States for managing video stream
  const [audio, setAudio] = useState(true); // States for managing audio stream

  const [screen, setScreen] = useState(null); // State to manage screen sharing
  const [screenAvailable, setScreenAvailable] = useState(false); // Screen sharing availability

  const [messages, setMessages] = useState([]); // State to hold chat messages
  const [message, setMessage] = useState(""); // Current message input

  const [askForUsername, setAskForUsername] = useState(true); // Ask for username
  const [username, setUsername] = useState(""); // Hold the username

  const [videos, setVideos] = useState([]); // Hold video streams of remote users
  const [showModal, setShowModal] = useState(false); // Show/hide chat modal
  const [newMessages, setNewMessages] = useState(0); // Count of new messages

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Runs when the component mounts to get user permissions for video or audio
    console.log("Lights, camera, connection");
    getPermissions(); // Get permissions for media
  }, []);

  let getDislayMedia = () => {
    if (screen) {
      // Screen sharing function
      if (navigator.mediaDevices.getDisplayMedia) {
        // Check if screen sharing is enabled
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true }) // Request screen sharing
          .then(getDislayMediaSuccess) // On success, call the success handler
          .catch((e) => console.log(e)); // Log any errors
      }
    }
  };

  const getPermissions = async () => {
    try {
      // Function to get permissions for video and audio
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video authorized");
      } else {
        setVideoAvailable(false);
        console.log("Video: User has not granted permission");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio authorized");
      } else {
        setAudioAvailable(false);
        console.log("Audio: User has not granted permission");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true); // Check if screen sharing is available
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream; // Store the local stream globally
          if (localVideoref.current) {
           
            localVideoref.current.srcObject = userMediaStream; // Set the local video element's source
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia(); // Call - get user media
      console.log("SET STATE HAS ", video, audio); // Log the states
    }
  }, [video, audio]);

  let getMedia = () => {
    // Function to initiate media stream and connect to the socket server
    setVideo(videoAvailable); // Set video, audio state based on availability
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop()); // Stop any existing tracks
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream; // Store the new stream globally
    localVideoref.current.srcObject = stream; // Set the local video element's source

    Object.keys(connections).forEach((id) => {
      if (id === socketIdRef.current) return; // Skip the current user's connection

      connections[id].addStream(window.localStream); // Add local to peer

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description) // Set local description
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }) // Send offer to remote peer
            );
          })
          .catch((e) => console.log(e));
      });
    });

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false); // Updates video state
        setAudio(false); // Updates audio state

        try {
          let tracks = localVideoref.current.srcObject.getTracks(); // Get current tracks
          tracks.forEach((track) => track.stop()); // Stop all tracks
        } catch (e) {
          console.log(e); // Log any errors
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]); // Creates a black screen and silence
        window.localStream = blackSilence(); // Update the local stream
        localVideoref.current.srcObject = window.localStream; // Set the local video element's source

        for (let id in connections) {
          connections[id].addStream(window.localStream); // Adding the black silence stream

          connections[id].createOffer().then((description) => {
            connections[id]
              .setLocalDescription(description) // Set the local description
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription }) // Send updated offer
                );
              })
              .catch((e) => console.log(e));
          });
        }
      };
    });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio }) // Request user media
        .then(getUserMediaSuccess) // On success, call the success handler
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks(); // Get current tracks
        tracks.forEach((track) => track.stop()); // Stop all tracks
      } catch (e) {}
    }
  };

  let getDislayMediaSuccess = (stream) => {
    console.log("HERE");
    try {
      window.localStream.getTracks().forEach((track) => track.stop()); // Stop existing tracks
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream; // Store the new stream globally
    localVideoref.current.srcObject = stream; // Set the local video element's source

    for (let id in connections) {
      if (id === socketIdRef.current) continue; // Skip the current user's connection

      connections[id].addStream(window.localStream); // Add the local stream to the connection

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description) // Set the local description
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }) // Send the offer to the remote peer
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false); // Update screen state
        try {
          let tracks = localVideoref.current.srcObject.getTracks(); // Get current tracks
          tracks.forEach((track) => track.stop()); // Stop all tracks
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]); // Create a black screen and silence
        window.localStream = blackSilence(); // Update the local stream
        localVideoref.current.srcObject = window.localStream; // Set the local video element's source

        getUserMedia(); // Call to get user media again
      };
    });
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message); // Parse the incoming message

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp)) // Set the remote description
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer() // Create an answer
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description) // Set the local description
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription, // Send the answer back
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice)) // Add the ICE candidate to the connection
          .catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(serverUrl, { secure: false }); // Connect to the socket server

    socketRef.current.on("signal", gotMessageFromServer); // Listen for incoming signals

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href); // Join the call with the current URL
      socketIdRef.current = socketRef.current.id; // Store the socket ID

      socketRef.current.on("chat-message", addMessage); // Listen for incoming chat messages

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id)); // Remove the user's video from the state
      });

      socketRef.current.on("user-joined", (id, clients) => {
        if (Array.isArray(clients)) {
          clients.forEach((socketListId) => {
            connections[socketListId] = new RTCPeerConnection(peerConfigConnections); // Create a new peer connection
      
            connections[socketListId].onicecandidate = function (event) {
              if (event.candidate != null) {
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate }) // Send the ICE candidate to the remote peer
                );
              }
            };
      
            connections[socketListId].onaddstream = (event) => {
              let videoExists = videoRef.current.find(
                (video) => video.socketId === socketListId // Check if the video already exists
              );
      
              if (videoExists) {
                setVideos((videos) => {
                  const updatedVideos = videos.map((video) =>
                    video.socketId === socketListId
                      ? { ...video, stream: event.stream } // Update the stream for the existing video
                      : video
                  );
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                });
              } else {
                let newVideo = {
                  socketId: socketListId,
                  stream: event.stream,
                  autoplay: true,
                  playsinline: true,
                };
      
                setVideos((videos) => {
                  const updatedVideos = [...videos, newVideo]; // Add the new video to the state
                  videoRef.current = updatedVideos;
                  return updatedVideos;
                });
              }
            };
      
            if (window.localStream !== undefined && window.localStream !== null) {
              connections[socketListId].addStream(window.localStream); // Add the local stream to the connection
            } else {
              let blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]); // Create a black silence stream
              window.localStream = blackSilence();
              connections[socketListId].addStream(window.localStream);
            }
          });
        }
      
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue; // Skip the current user's connection
      
            try {
              connections[id2].addStream(window.localStream); // Add the local stream to the connection
            } catch (e) {}
      
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description) // Set the local description
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }) // Send the offer to the remote peer
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
      
    });
  };

  let silence = () => {
    let ctx = new AudioContext(); // Create a new audio context
    let oscillator = ctx.createOscillator(); // Create an oscillator
    let dst = oscillator.connect(ctx.createMediaStreamDestination()); // Connect to a media stream destination
    oscillator.start(); // Start the oscillator
    ctx.resume(); // Resume the audio context
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false }); // Return a silent audio track
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height); // Fill the canvas with black
    let stream = canvas.captureStream(); // Capture the canvas as a video stream
    return Object.assign(stream.getVideoTracks()[0], { enabled: false }); // Return a black video track
  };

  let handleVideo = () => {
    setVideo(!video); // Toggle the video state
  };

  let handleAudio = () => {
    setAudio(!audio); // Toggle the audio state
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia(); // Call to get display media
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen); // Toggle the screen state
  };

  let handleEndCall = () => {
    console.log("End call button clicked");
    try {
      let tracks = localVideoref.current.srcObject.getTracks(); // Get current tracks
      tracks.forEach((track) => track.stop()); // Stop all tracks
    } catch (e) {}
    navigate("/home"); // Redirect to the home page
  };

  let openChat = () => {
    setShowModal(true); // Show the chat modal
    setNewMessages(0); // Reset new messages count
  };

  let closeChat = () => {
    setShowModal(false); // Hide the chat modal
  };

  let handleMessage = (e) => {
    setMessage(e.target.value); // Update the message state
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }, // Add the new message to the state
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1); // Increment new messages count if it's not from the current user
    }
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username); // Send the message to the server
    setMessage(""); // Clear the message input
  };

  let connect = () => {
    setAskForUsername(false); // Hide the username prompt
    getMedia(); // Call to get media
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>lyn-k </h2>
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
            <video ref={localVideoref} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>
                  {messages.length !== 0 ? (messages.map((item, index) => {
                      return (
                        <div style={{ marginBottom: "8px" }} key={index}>
                          <p>{item.sender}</p>
                          <p style={{ fontSize: "18px" }}>{item.data}</p>
                        
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={handleMessage}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "#000000" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "Red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} style={{ color: "#000000" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "#000000" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : null}

            <Badge badgeContent={newMessages} max={999} color="primary">
              <IconButton
                onClick={() => setShowModal(!showModal)}
                style={{ color: "#000000" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          ></video>

          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
