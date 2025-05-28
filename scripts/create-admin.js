import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// MongoDB connection
const MONGODB_URI = "mongodb://localhost:27017/calendar-app";

// User schema (simplified version for script)
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    roles: [
      {
        type: String,
        enum: ["admin", "user"],
        default: ["user"],
      },
    ],
  },
  { timestamps: true },
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: "admin",
      password: "admin123",
      displayName: "System Administrator",
      roles: ["admin", "user"],
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Roles: admin, user");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

createAdmin();
