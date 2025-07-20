import { useEffect } from "react";
import { io } from "socket.io-client";

export default function useSocket(userId) {
  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      socket.emit("register", userId);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
}
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  path: "/socket.io/",
  withCredentials: true,
  transports: ["websocket", "polling"], // Try both transports
});

// Example usage in a React component
export const useSocket = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to Socket.IO");
      // Register user for updates if logged in
      if (user) {
        socket.emit("register", user._id);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user]);

  return socket;
};
