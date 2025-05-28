import { z } from "zod";
import { Calendar } from "~/server/models/Calendar.model";
import { requireAdminAuth } from "~/server/utils/auth";

const createCalendarSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  category: z.string().max(50).trim().optional(),
  ownerId: z.string().optional(),
});

export default defineEventHandler(async event => {
  try {
    // Require admin authentication
    const currentUser = await requireAdminAuth(event);

    const body = await readBody(event);
    const { name, category, ownerId } = createCalendarSchema.parse(body);

    // Create new calendar
    const calendar = new Calendar({
      name,
      category,
      ownerId: ownerId || currentUser.id,
      permissions: [], // Start with empty permissions, admin can assign later
    });

    await calendar.save();

    return {
      calendar: {
        id: calendar._id.toString(),
        name: calendar.name,
        category: calendar.category,
        ownerId: calendar.ownerId?.toString(),
        permissions: calendar.permissions,
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
