import { getConnectionState } from "~/server/utils/database";

export default defineEventHandler(async _event => {
  const dbState = getConnectionState();

  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    database: {
      status: dbState.state,
      readyState: dbState.readyState,
      host: dbState.host,
      port: dbState.port,
      name: dbState.name,
      connected: dbState.readyState === 1,
    },
  };
});
