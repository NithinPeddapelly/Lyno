import { Server } from "socket.io"


export const connectToSocket = (server)=>{
    const io = new Server;    //this server is node http server

    return io;
} 
