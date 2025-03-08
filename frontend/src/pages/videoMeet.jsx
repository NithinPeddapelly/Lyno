import React, { useState, useRef, useEffect } from "react";
import { TextField, Button, Badge, IconButton } from "@mui/material";
import "../styles/videoComponent.css";
import { io } from "socket.io-client";

const serverUrl = "http://localhost:8000";

var connections = {}; // Object to hold Peer connections for each user

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Configuration for WebRTC peer c0nnections, using Google's STUN server for NAT traversal
};

export default function VideoMeetComponent() 
{
  	//  Using refs to hold mutable values that do not cause re-renders
  var socketRef = useRef(); //  Reference for socket connection
  let socketIdRef = useRef(); //  Reference to store the socket ID of the current user
  let localVideoref = useRef(); //	Reference for the local video element
  let videoRef = useRef([]); //  Reference to hold video elements for remote users

  const [videoAvailable, setVideoAvailable] = useState(true); // Is video,audio available?
  const [audioAvailable, setAudioAvailable] = useState(true);

  const [video, setVideo] = useState(null);  // States for managing video,audio stream
  const [audio, setAudio] = useState(null);

  const [screen, setScreen] = useState(null);  // State to manage screen sharing

  const [screenAvailable, setScreenAvailable] = useState(false); // screen sharing availablity
  const [messages, setMessages] = useState([]); // State to hold chat messages
  const [message, setMessage] = useState("");  //  current message input

  const [askForUsername, setAskForUsername] = useState(true); // ask for username
  const [username, setUsername] = useState(""); // hold the username

  const [videos, setVideos] = useState([]); // hold video streams of Remote users
  const [showModal, setShowModal] = useState(false); // show/hide chat modal
  const [newMessages, setNewMessages] = useState(0); // Count of new messages

  useEffect(() => {
    //runs when the component mounts to get user permissions for video or audio
    console.log("Lights, camera, connection");
    getPermissions(); //  get permissions for media
  }, []); // this runs only once

  let getDislayMedia = () => {
    
    if (screen) {	// screen sharing fonction
     
      if (navigator.mediaDevices.getDisplayMedia) {   // Check if screen sharing is enabled
       
        navigator.mediaDevices 			// Check wheaterh the browser supports screen sharing
          .getDisplayMedia({ video: true, audio: true }) // Request screen sharing
          .then(getDislayMediaSuccess) // On success, call the success handler
          .catch((e) => console.log(e)); // Log any errors
      }
    }
  };

  const getPermissions = async () => {  
    
    try { // Function to get permissions for video and audio
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        // Request video permission
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video-authorized");
      } else {
        setVideoAvailable(false);
        console.log("Video: User has not granted permission");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
       
        audio: true,  // Request audio permission
      });
      if (audioPermission) {
        setAudioAvailable(true); // Audio is authorized
        console.log("Audio authorized");
      } else {
        setAudioAvailable(false); // Audio is not authorized
        console.log("Audio: User has not granted permission");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        
        setScreenAvailable(true); //  Check if screen sharing is available
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ // If either video or audio is available, this will get the media stream
          video: videoAvailable, //Requesting user media
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream; // Store the local stream globally "Buwa Hahaha I'm a local stream"
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream; // Set the local video element's source- "aye aye cap"
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {

    if (video !== undefined && audio !== undefined) { //   fetch user media when video or audio state changes
      getUserMedia(); // Call - get user media
      console.log("SET STATE HAS ", video, audio); // Log the states
    }
  }, [video, audio]); // Dependencies: A & V states

  let getMedia = () => {
    // Function to initiate media stream and connect to the socket server
    setVideo(videoAvailable); // Set video,Audio state based on availability
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    
    try { // if Success - handler for getting user media
      window.localStream.getTracks().forEach((track) => track.stop()); // Stop any existing tracks
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream; //  Store the new stream globally
    localVideoref.current.srcObject = stream; // 	Set the local video element's source

    for (let id in connections) {
      // Loop through all connections and add the local stream
      if (id === socketIdRef.current) continue;  // Skip the current user's connection

      connections[id].addStream(window.localStream); 	// Add local to peer

      connections[id].createOffer().then((description) => {
        // Creating offer for remote peer
        console.log(description);
        connections[id]
          .setLocalDescription(description) // Set local description
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }) //  Send offer t0 remote peer
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      // Handle track ending (like- user stops video or some other reason)
      (track) =>
        (track.onended = () => {
          setVideo(false); // Updates video state
          setAudio(false); //Updates audio state

          try {
            let tracks = localVideoref.current.srcObject.getTracks(); // Get current tracks
            tracks.forEach((track) => track.stop()); // Stop all tracks
          } catch (e) {
            console.log(e); // Log any errors
          }

         
          let blackSilence = (...args) =>   // Creates a black screen and silence-  when the user stops video/audio
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();  // Update the local stream
          localVideoref.current.srcObject = window.localStream; // Set the local video element's source

          
          for (let id in connections) { // Loop through all connections and add the black silence stream
            connections[id].addStream(window.localStream);	 // Adding the black silence stream

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
        })
    );
  };

  
  let getUserMedia = () => {  	// Function to get user media based on current video/audio states
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio }) // Request user media
        .then(getUserMediaSuccess)  // On success, call the success handler
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks(); 	// Get current tracks
        tracks.forEach((track) => track.stop()); //    Stop all tracks
      } catch (e) {}
    }
  };

  // Success handler for getting display media (screen sharing)
  let getDislayMediaSuccess = (stream) => {
    console.log("HERE"); // Just a friendly log
    try {
      window.localStream.getTracks().forEach((track) => track.stop()); // Stop existing tracks
    } catch (e) {
      console.log(e); // Log any errors
    }

    window.localStream = stream; // Store the new stream globally
    localVideoref.current.srcObject = stream; // Set the local video element's source

    // Loop through all connections and add the local stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue; 	// Skip the current user's connection

      connections[id].addStream(window.localStream);  // Add the local stream to the peer connection

      // Create an offer for the remote peer
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description) 	// Set the local description
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }) // Send the offer to the remote peer
            );
          })
          .catch((e) => console.log(e)); 	// Log any errors
      });
    }

    // Handle track ending (e.g., user stops screen sharing)
    stream.getTracks().forEach((
      track) =>
        (track.onended = () => {
          setScreen(false); 	// Update screen state
      try {
            let tracks = localVideoref.current.srcObject.getTracks();  // Get current tracks
            tracks.forEach((track) => track.stop()); // Stop all tracks
          } catch (e) {
            console.log(e);  // Log any errors
          }

          // Create a black screen and silence for when the user stops screen sharing
          let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence(); 	 // Update the local stream
          localVideoref.current.srcObject = window.localStream;  // Set the local video element's source

          getUserMedia(); // Call to get user media again
        })
    );
  };

// Function "The Watchdog 🐕‍🦺" - Your vigilant guardian that handles incoming messages from the server
let gotMessageFromServer = (fromId, message) => {
	var signal = JSON.parse(message); // Parse the incoming message
  
	if (fromId !== socketIdRef.current) {
	  // Ignore messages from the current user
	  console.log("🐕Watchdog🐕‍🦺: Analyzing transmission… only secure messages shall pass.");
  
	  if (signal.sdp) {
		// If the message contains an SDP - Watchdog verifies it
		console.log(" Watchdog 🐕‍🦺: Signal recognized. Processing secure connection...");
  
		connections[fromId]
		  .setRemoteDescription(new RTCSessionDescription(signal.sdp)) // Set the remote description
		  .then(() => {
			if (signal.sdp.type === "offer") {
			  // If it's an offer
			  console.log(" Watchdog🐕‍🦺: Offer detected. Responding with an answer.");
  
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
					.catch((e) => console.log("🐶 Watchdog Alert: Error setting local description.", e)); 
				})
				.catch((e) => console.log("🐶 Watchdog Alert: Error creating an answer.", e)); 
			}
		  })
		  .catch((e) => console.log("🐶 Watchdog Alert: Error setting remote description.", e));
	  }

	  if (signal.ice) {
		// If the message contains ICE candidates - Watchdog secures them
		console.log("🐕‍🦺 Watchdog: ICE candidate received. Securing connection...");
  
		connections[fromId]
		  .addIceCandidate(new RTCIceCandidate(signal.ice)) // Add the ICE candidate to the connection
		  .catch((e) => console.log("🐶  Watchdog Alert: Error adding ICE candidate.", e)); // Log errors
	  }
	}
  };
  
  // Function to connect to the socket server
  let connectToSocketServer = () => {
    socketRef.current = io.connect(serverUrl, { secure: false }); // Connect to the socket server

    socketRef.current.on("signal", gotMessageFromServer); // Listen for incoming signals

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href); // Join the call with the current URL
      socketIdRef.current = socketRef.current.id; // Store the socket ID

      socketRef.current.on("chat-message", addMessage); // Listen for incoming chat messages

      // Handle when a user leaves
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id)); // Remove the user's video from the state
      });

      // Handle when a user joins
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          ); // Create a new peer connection

          // Wait for their ICE candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }) // Send the ICE candidate to the remote peer
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current); // Log the current video references
            console.log("FINDING ID: ", socketListId); // Log the ID being processed

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId // Check if the video already exists
            );

            if (videoExists) {
              console.log("FOUND EXISTING"); // Log if an existing video is found

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream } // Update the stream for the existing video
                    : video
                );
                videoRef.current = updatedVideos; // Update the video references
                return updatedVideos; // Return the updated videos
              });
            } else {
              // Create a new video
              console.log("CREATING NEW"); // Log that a new video is being created
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo]; // Add the new video to the state
                videoRef.current = updatedVideos; // Update the video references
                return updatedVideos; // Return the updated videos
              });
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream); // Add the local stream to the connection
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]); // Create a black silence stream
            window.localStream = blackSilence(); // Update the local stream
            connections[socketListId].addStream(window.localStream); // Add the black silence stream
          }
        });

        // If the current user just joined, add their stream to all other connections
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
                .catch((e) => console.log(e)); // Log any errors
            });
          }
        }
      });
    });
  };

  // Function to create a silent audio track
  let silence = () => {
    let ctx = new AudioContext(); // Create a new audio context
    let oscillator = ctx.createOscillator(); // Create an oscillator
    let dst = oscillator.connect(ctx.createMediaStreamDestination()); // Connect to a media stream destination
    oscillator.start(); // Start the oscillator
    ctx.resume(); // Resume the audio context
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false }); // Return a silent audio track
  };

  // Function to create a black video track
  let black = ({ width = 1280, height = 720 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,height
    });
    canvas.getContext("2d").fillRect(0, 0, width, height); // Fill the canvas with black
    let stream = canvas.captureStream(); // Capture the canvas as a video stream
    return Object.assign(stream.getVideoTracks()[0], { enabled: false }); // Return a black video track
  };

  // Function to toggle video state
  let handleVideo = () => {
    setVideo(!video); // Toggle the video state
    // getUser Media(); // Uncomment to get user media again
  };

  // Function to toggle audio state
  let handleAudio = () => {
    setAudio(!audio); // Toggle the audio state
    // getUser Media(); // Uncomment to get user media again
  };

  // Effect to get display media when screen state changes
  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia(); // Call to get display media
    }
  }, [screen]); // Dependency: screen state

  // Function to toggle screen sharing state
  let handleScreen = () => {
    setScreen(!screen); // Toggle the screen state
  };

  // Function to end the call and redirect to the home page
  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks(); // Get current tracks
      tracks.forEach((track) => track.stop()); // Stop all tracks
    } catch (e) {}
    window.location.href = "/"; // Redirect to the home page
  };

  // Function to open the chat modal
  let openChat = () => {
    setModal(true); // Show the chat modal
    setNewMessages(0); // Reset new messages count
  };

  // Function to close the chat modal
  let closeChat = () => {
    setModal(false); // Hide the chat modal
  };

  // Function to handle message input changes
  let handleMessage = (e) => {
    setMessage(e.target.value); // Update the message state
  };

  // Function to add a message to the chat
  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }, // Add the new message to the state
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1); // Increment new messages count if it's not from the current user
    }
  };

  // Function to send a message to the chat
  let sendMessage = () => {
    console.log(socketRef.current); // Log the current socket reference
    socketRef.current.emit("chat-message", message, username); // Send the message to the server
    setMessage(""); // Clear the message input
  };

  // Function to connect the user and get media
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
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      console.log(messages);
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
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
                    onChange={(e) => setMessage(e.target.value)}
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
          ) : (
            <></>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="orange">
              <IconButton
                onClick={() => setModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />{" "}
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
