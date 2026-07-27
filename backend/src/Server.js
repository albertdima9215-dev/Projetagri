require("dotenv").config();
const app = require("./App");

const connectDB = require("./config/database");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});