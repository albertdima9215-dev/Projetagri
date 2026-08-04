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
const users = {};

io.on("connection", (socket) => {
  console.log("Utilisateur connecté :", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log("Utilisateur enregistré :", userId);
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

// Rendre io accessible dans les contrôleurs
app.set("io", io);
app.set("users", users);

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});