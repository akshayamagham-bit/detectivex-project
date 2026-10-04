import { io } from "socket.io-client";

export const socket = io("http://https://detectivex-project-production.up.railway.app", {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
});

socket.on("connect", () => {
    console.log("Connected to DetectiveX Backend:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected from DetectiveX Backend:", reason);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
});