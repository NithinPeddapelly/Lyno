import { Server } from "socket.io";

let connections = {}; // Stores active connections for each call
let messages = {}; // Stores chat messages for each call
let timeOnline = {}; // Stores the time a user joined the call

// Function to initialize and configure Socket.IO server
export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      // Allowing cross-origin requests for testing; will be removed in production
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Handling new socket connections
    console.log("SOMETHING CONNECTED");

    // Handling users joining a call
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id); // Store the socket ID for the call
      timeOnline[socket.id] = new Date(); // Track when the user joined

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      // Send stored chat messages to the newly joined user
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; ++a) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      // Handling WebRTC signaling between users
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      // Handling chat messages in a call
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true]; // Properly updates the room when found
          }
          return [room, isFound]; // Keeps the previous room unchanged if not found
        },
        ["", false] // Initial values
      );

      if (found) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, ":", sender, data);

        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    // Handling user disconnection
    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date()); // Calculate session duration
      var key;

      // Find and remove the disconnected user from connections
      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections))
      )) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;

            // Notify remaining users that someone has left
            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit("user-left", socket.id);
            }
            var index = connections[key].indexOf(socket.id);

            // Remove the disconnected user
            connections[key].splice(index, 1);

            // If no users are left in the call, delete the call record
            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });

  return io; // Return the configured Socket.IO instance
};
