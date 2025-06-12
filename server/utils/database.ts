import mongoose from "mongoose";

// This utility is for manual connection management if needed
// The main connection is handled by the MongoDB plugin

export async function ensureConnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    // Connection is connecting, wait for it
    return new Promise((resolve, reject) => {
      mongoose.connection.once("connected", () => resolve(mongoose.connection));
      mongoose.connection.once("error", reject);
    });
  }

  // If not connected, the plugin should handle this
  throw new Error("Database not connected. Ensure the MongoDB plugin is loaded.");
}

export function getConnectionState() {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    state: states[mongoose.connection.readyState] || "unknown",
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
}

export { mongoose };
