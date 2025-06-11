import { Calendar } from "~/server/models/Calendar.model";
import { requireAdminAuth } from "~/server/utils/auth";
import { createCalendarSchema, type CreateCalendarInput } from "~/types/validation";

export default defineEventHandler(async event => {
  try {
    // Require admin authentication
    const currentUser = await requireAdminAuth(event);

    const body = await readBody(event);
    const { name, category, ownerId, isPublic } = createCalendarSchema.parse(body);

    // Create new calendar
    const calendar = new Calendar({
      name,
      category,
      ownerId: ownerId || currentUser.id,
      permissions: [], // Start with empty permissions, admin can assign later
      isPublic: isPublic || false,
    });

    await calendar.save();

    return {
      calendar: {
        id: calendar._id.toString(),
        name: calendar.name,
        category: calendar.category,
        ownerId: calendar.ownerId?.toString(),
        permissions: calendar.permissions,
        isPublic: calendar.isPublic,
        createdAt: calendar.createdAt,
        updatedAt: calendar.updatedAt,
      },
      message: "Calendar created successfully",
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid input data",
      });
    }
    throw error;
  }
});
