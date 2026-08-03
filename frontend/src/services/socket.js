import { io } from "socket.io-client";

const socket = io("https://projetagri.onrender.com");

export default socket;