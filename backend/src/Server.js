/*require("dotenv").config();
const app = require("./App");

const connectDB = require("./config/database");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});*/

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// utilisateurs connectés
const users = {};

io.on("connection", (socket) => {
  console.log("Utilisateur connecté :", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log("Register", userId);
  });

  socket.on("disconnect", () => {
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
      }
    }

    console.log("Utilisateur déconnecté");
  });
});

app.set("io", io);
app.set("users", users);

// ... tes routes ici

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Serveur lancé sur ${PORT}`);
});