//import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
app.use(cors);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server started successfully at Port ${PORT}`);
});
