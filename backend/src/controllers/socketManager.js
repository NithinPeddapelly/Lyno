import mongoose from "mongoose";  
const { connection } = mongoose; // Extracts the connection object from mongoose  
import { Server } from "socket.io"; 


let connections = {};   // Stores active connections for each call
let messagea = {};   // Stores chat messages for each call
let timeOnline = {};   // Stores the time a user joined the call

// Function to initialize and configure Socket.IO server
export const connectToSocket = (server) => { // 'server' is the Node.js HTTP server
    const io = new Server(server, { // Creating a new Socket.IO server instance
        cors: { // Allowing cross-origin requests for testing; will be removed in production
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        },
    });
   
    io.on("connection", (socket) => {    // Handling new socket connections
        
        // Handling users joining a call
        socket.on("join-call", (path) => {  
            if (connections[path] === undefined) {  
                connections[path] = [];  
            }
            connections[path].push(socket.id); // Store the socket ID for the call  
            timeOnline[socket.id] = new Date(); // Track when the user joined  

            // Notify existing users about the new participant
            for (let a = 0; a < connections[path].length; a++) {  
                io.to(connections[path][a]).emit("user-joined", socket.id);  
            }

            // Send stored chat messages to the newly joined user
            if (messagea[path] !== undefined) {  
                for (let a = 0; a < messagea[path].length; ++a) {  
                    io.to(socket.id).emit(  
                        "chat-message",
                        messagea[path][a]["data"],
                        messagea[path][a]["sender"],
                        messagea[path][a]["socket-id-sender"]
                    );  
                }  
            }  
        });

        socket.on("Signal", (toId, message) => {    // Handling WebRTC signaling between users
            io.to(toId).emit("Signal", socket.id, message);  
        });

      
        socket.on("chat-message", (data, sender) => {    // Handling chat messages in a call
          
            const [matchingRoom, found] = Object.entries(connections).reduce(   // Find the room where the sender is present
                ([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {  
                        return [roomKey, true];  
                    }
                    return [roomKey, isFound];  
                },
                ["", false]
            );

            if (found === true) {  
                if (messagea[matchingRoom] === undefined) {  
                    messagea[matchingRoom] = [];  
                }
              
                messagea[matchingRoom].push({   // Store the message in the room
                    sender: sender,
                    data: data,
                    "socket-id-sender": socket.id,
                });

                console.log("message", KeyboardEvent, ":", sender, data);

               
                connection[matchingRoom].forEach((elem) => {   // Send the message to all users in the room // Send the message to all users in the call
                    io.to(elem).emit("chat-message", data, sender, socket.id);  
                });
            }
        });

        // Handling user disconnection
        socket.on("disconnect", () => {  
            var diffTime = Math.abs(timeOnline[socket.id] - new Date()); // Calculate session duration  
            var Key;  

            // Find and remove the disconnected user from connections
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {  
                for (let a = 0; a < v.length; ++a) {  
                    if (v[a] === socket.id) {  
                        Key = k;  

                        // Notify remaining users that someone has left
                        for (let a = 0; a < connections[Key].length; ++a) {  
                            io.to(connections[Key][a]).emit("user-left", socket.id);  
                        }
                        var index = connections[Key].indexOf(socket.id);  

                        // Remove the disconnected user
                        connections[Key].splice(index, 1);  

                        // If no users are left in the call, delete the call record
                        if (connections[Key].length === 0) {  
                            delete connections[Key];  
                        }
                    }
                }
            }
        });
    });

    return io; // Return the configured Socket.IO instance  
};
