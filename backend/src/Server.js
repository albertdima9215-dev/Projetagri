require("dotenv").config();
const app = require("./App");

const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 5000;

connectDB();

// Créer le serveur HTTP à partir de l'app Express existante
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Utilisateurs connectés
io.on("connection", (socket) => {
  console.log("Utilisateur connecté :", socket.id);

  socket.on("register", (userId) => {
    if (!userId) return;

    socket.join(`user:${userId}`);

    console.log(
      `Utilisateur ${userId} enregistré sur la room user:${userId}`
    );
  });

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté :", socket.id);
  });
});

// Rendre io accessible dans les contrôleurs
app.set("io", io);

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});