import mongoose from "mongoose";

let isConnected = false;

async function connectToMongoDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const config = useRuntimeConfig();

  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
    });

    isConnected = true;
    console.log("✅ MongoDB connected successfully");

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", err => {
      console.error("🔴 Mongoose connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🟡 Mongoose disconnected from MongoDB");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🟢 Mongoose reconnected to MongoDB");
      isConnected = true;
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    isConnected = false;
    throw error;
  }
}

export default defineNitroPlugin(async nitroApp => {
  // Connect to MongoDB when the server starts
  await connectToMongoDB();

  // Add hook to ensure connection before each request
  nitroApp.hooks.hook("request", async () => {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      try {
        await connectToMongoDB();
      } catch (error) {
        console.error("Failed to reconnect to MongoDB:", error);
      }
    }
  });

  // Graceful shutdown
  nitroApp.hooks.hook("close", async () => {
    if (isConnected) {
      await mongoose.connection.close();
      console.log("🔴 MongoDB connection closed due to server shutdown");
    }
  });
});
