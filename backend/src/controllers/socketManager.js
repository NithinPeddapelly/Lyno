import { Server } from "socket.io"

let connections = {}
let messagea = {}
let timeOnline = {}

export const connectToSocket = (server)=>{
    const io = new Server;    //this server is node http server

    io.on("connection", (socket) => {
        socket.on("join-call",(path)=> {
            if(connections[path] === undefined){
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            for(let a=0;a<connections[path].length;a++){
                io.to(connections[path][a]).emit("user-joined",socket.id)
            }

            if(messagea[path] !== undefined){
                for(let a = 0; a < messages[path].length; ++a){
                    io.to(socket.id).emit("chat-message",messages[path][a]["data"],
                        messages[path][a]["sender"],messages[path][a]["socket-id-sender"])
                }
            }
        })
        socket.on("Signal",(toId,message)=> {
            io.to(toId).emit("Signal",socket.id,message);
        })

        socket.on("chat-message",(data, sender)=>{

            const [matchingRoom, found] = Object.entries(connections)
            .reduce(([room, isFound], [roomKey, roomValue]) => {

                if (!isFound && roomValue.includes(socket.id)){
                    return [roomKey, true];
                }
                return[roomKey, isFound];
            }, ["", false]);

            if(found === true){
                if(messagea[matchingRoom] === undefined){
                    messagea[matchingRoom] = []
                }
                messagea[matchingRoom].push({"sender": sender,"data": data,"socket-id-sender":socket.id})
            }

        })

        socket.on("disconnect",()=>{

        })
    })
 
    return io;
} 
 