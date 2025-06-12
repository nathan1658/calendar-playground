import { User } from "~/server/models/User.model";
import { requireAdminAuth } from "~/server/utils/auth";
import { createUserSchema } from "~/types/validation";

export default defineEventHandler(async event => {
  try {
    // Require admin authentication
    await requireAdminAuth(event);

    // Get request body
    const body = await readBody(event);

    // Validate input
    const validatedData = createUserSchema.parse(body);

    // Check if username already exists
    const existingUser = await User.findOne({ username: validatedData.username });
    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: "Username already exists",
      });
    }

    // Create user (password will be hashed automatically by pre-save middleware)
    const user = new User({
      username: validatedData.username,
      password: validatedData.password,
      displayName: validatedData.displayName,
      roles: validatedData.roles,
    });

    const savedUser = await user.save();

    return {
      user: {
        id: savedUser._id.toString(),
        username: savedUser.username,
        displayName: savedUser.displayName,
        roles: savedUser.roles,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
    };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Create user error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create user",
    });
  }
});