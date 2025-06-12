import { User } from "~/server/models/User.model";

export default defineNitroPlugin(async () => {
  const runtimeConfig = useRuntimeConfig();
  const username = runtimeConfig.initialAdminName;
  const password = runtimeConfig.initialAdminPassword;

  console.log("Initial admin user name: " + username);
  console.log("Initial admin user password: " + password);

  try {
    await ensureConnection();
    console.log("🔍 Checking if admin user already exists...");
    const adminExists = await User.exists({ username });

    if (adminExists) {
      console.log("⚠️  Admin user already exists");
      console.log("👤 Username: admin");
      console.log("ℹ️  Admin user is ready for use");
      return;
    }

    // Create admin user using the reusable utility
    console.log("👤 Creating admin user...");
    await User.create(
      {
        username,
        password,
        displayName: "Administrator",
        roles: ["admin"],
      },
      {
        skipValidation: true, // Skip validation for system initialization
        createdBy: "system",
      },
    );

    console.log("🎉 Admin user created successfully!");
    console.log("📋 Login credentials:");
    console.log("   Username: " + username);
    console.log("   Password: " + password);
    console.log("🔒 IMPORTANT: Please change the password after first login!");
  } catch (error: any) {
    console.error("❌ Error in admin initialization:", error.message);
    console.log("⚠️  Server will continue without admin user creation");
  }

  console.log("✨ Admin initialization plugin completed");
});
