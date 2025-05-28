import mongoose from "mongoose";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  try {
    await mongoose.connect(config.mongodbUri);
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
});
