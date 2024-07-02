//import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import express from "express";
import { Redis } from "ioredis";
import "dotenv/config";

const app = express();
app.use(cors);

const server = http.createServer(app);

// Creating 2 Resis instance
// 1st redis instance is for accessing and updating data in the redis database
const redis = new Redis(process.env.REDIS_CONNECTION_STRING);
// 2nd redis instance is for opening redis connection once the user has joined the room in "socket.io"
const connRedis = new Redis(process.env.REDIS_CONNECTION_STRING);

// Setting up Socket.io server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Recieve the message sent from client through Redis Publish/Subscribe and through Socket.io we are sending the update message content to all the client through "emit" function
connRedis.on("message", (channel, message) => {
  io.to(channel).emit("room-update", message);
});

connRedis.on("error", (err) => {
  console.error("Connection error", err);
});

// Creating Socker Connection so that front-end can connect
io.on("connection", async (socket) => {
  const { id } = socket;
  // Here we are creating a connection "join-room". So when front end connects socket.io by passing paramter as "join-room", then this function will be executed
  socket.on("join-room", async (room: string) => {
    console.log("User joined room", room);
    const subscribedRooms = await redis.smembers("subscribed-rooms");
    await socket.join(room);
    await redis.sadd(`rooms:${id}`, room); // Saving the user who joined that particular room in redis
    await redis.hincrby("room-connections", room, 1); // Incrementing total members connected to all rooms in redis

    // if the particular room has not been subscribed then we are opening that room to subscribe, so that any changes in the front-end who are connected to that room will be updated here
    if (!subscribedRooms.includes(room)) {
      connRedis.subscribe(room, async (err) => {
        if (err) {
          console.log("Error is: ", err);
        } else {
          await redis.sadd("subscribed-rooms", room);
          console.log("Successfully subscribed to room: ", room);
        }
      });
    }
  });

  // Closing connection logic when user exits the application
  socket.on("disconnect", async () => {
    const { id } = socket; //  Will return the Client ID of that particular socker connection
    const joinedRooms = await redis.smembers(`rooms:${id}`); // Will return the list of rooms that particuar client has connected
    await redis.del(`rooms:${id}`); // Deleting the room:id from the redis

    joinedRooms.forEach(async (room) => {
      // Now once the client closes the application, we need to decrement his connection from the list of rooms he previously connected
      const remainingConnections = await redis.hincrby(
        "room-connections",
        room,
        -1
      ); // Decrementing the list of rooms user previously connected by -1
      if (remainingConnections <= 0) {
        // If that room connection falls to zero or lower, we need to remove that room from the "subscribed-room" hash.
        await redis.hdel("room-connections", room);
        // Also we need to usubscribe the closed room
        connRedis.unsubscribe(room, async (err) => {
          if (err) {
            console.log("Failed to unsubscribe", err);
          } else {
            await redis.srem("subscribed-rooms", room);
          }
        });
      }
    });
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server started successfully at Port ${PORT}`);
});
