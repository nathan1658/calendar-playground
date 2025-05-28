import { User } from "~/server/models/User.model";
import { Calendar } from "~/server/models/Calendar.model";
import { requireAdminAuth } from "~/server/utils/auth";

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

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Don't allow deleting the last admin user
    if (existingUser.roles.includes("admin")) {
      const adminCount = await User.countDocuments({ roles: "admin" });
      if (adminCount <= 1) {
        throw createError({
          statusCode: 400,
          statusMessage: "Cannot delete the last admin user",
        });
      }
    }

    // Remove user from all calendar permissions
    await Calendar.updateMany({ "permissions.userId": userId }, { $pull: { permissions: { userId } } });

    // Remove user from calendar ownership (set to null)
    await Calendar.updateMany({ ownerId: userId }, { $unset: { ownerId: 1 } });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Delete user error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete user",
    });
  }
});
