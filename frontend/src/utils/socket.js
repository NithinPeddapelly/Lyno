import { io } from "socket.io-client";
import server from "../environment";

const socket = io(server, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
