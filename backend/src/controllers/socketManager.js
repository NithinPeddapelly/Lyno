import mongoose from "mongoose";
const { connection } = mongoose;
import { Server } from "socket.io"

let connections = {}
let messagea = {}
let timeOnline = {}

export const connectToSocket = (server)=>{    //this server is node http server
    const io = new Server(server ,{     
        cors:{
            origin:"*",
            methods:["GET","POST"],
            allowedHeaders:["*"],
            credentials:true
        }
    });  

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
                console.log("message", KeyboardEvent,":",sender,data)

                connection[matchingRoom].forEach((elem) =>{
                    io.to(elem).emit("chat-message",data,sender,socket.id)  // to know who is online or who is sending message
                })
            }

        })

        socket.on("disconnect",()=>{
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var Key

            for(const [k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){

                for (let a = 0; a < v.length; ++a) {
                    if(v[a] === socket.id){
                        Key = k

                        for(let a = 0; a < connections[Key].length; ++a){
                            io.to(connections[Key][a]).emit("user-left",socket.id)
                        }
                        var index = connections[Key].indexOf(socket.id)

                        connections[Key].splice(index, 1)

                        if(connections[Key].length === 0){
                            delete connections[Key]
                        }
                    }
            }
        }
        })
    })
 
    return io;
} 
 