import { User } from "~/server/models/User.model";
import { requireAdminAuth } from "~/server/utils/auth";
import { updateUserSchema } from "~/types/validation";

export default defineEventHandler(async event => {
  try {
    // Require admin authentication
    await requireAdminAuth(event);

    // Get user ID from URL
    const userId = getRouterParam(event, "id");
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    // Get request body
    const body = await readBody(event);

    // Validate input
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, validatedData, { new: true, select: "-password" });

    if (!updatedUser) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to update user",
      });
    }

    return {
      user: {
        id: updatedUser._id.toString(),
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        roles: updatedUser.roles,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Update user error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update user",
    });
  }
});
