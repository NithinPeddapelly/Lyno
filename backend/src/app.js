import express from 'express';
import {createServer} from "node:http";

import {Server} from "socket.io";

import mongoose from "mongoose";
 import cors from "cors";

 const app = express();

 app.get("/home",(req, res)=>{  // home is the route
    return res.json({"hello":"world"});
 });

 const start = async () => {

    app.listen(8000, () =>{ // 8000 is the port number
        console.log("Server is running on port 8000");
    })
 }

 start();