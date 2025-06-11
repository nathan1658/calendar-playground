import { Calendar } from "~/server/models/Calendar.model";
import { requireAuth } from "~/server/utils/auth";
import { updateCalendarSchema, type UpdateCalendarInput } from "~/types/validation";
import type { PopulatedCalendar } from "~/types/database";

export default defineEventHandler(async event => {
  const currentUser = await requireAuth(event);
  const calendarId = getRouterParam(event, "id");

  if (!calendarId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Calendar ID is required",
    });
  }

  // Find calendar
  const calendar = (await Calendar.findById(calendarId)) as PopulatedCalendar | null;

  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Calendar not found",
    });
  }

  // Check permissions: admin can edit any calendar, users need edit permission
  const hasEditPermission =
    currentUser.roles.includes("admin") ||
    calendar.permissions.some(perm => perm.userId.toString() === currentUser.id && perm.accessLevel === "edit");

  if (!hasEditPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: "Edit permission required for this calendar",
    });
  }

  const body = await readBody(event);
  const updates = updateCalendarSchema.parse(body);

  // Update calendar
  const updatedCalendar = (await Calendar.findByIdAndUpdate(
    calendarId,
    { $set: updates },
    { new: true, runValidators: true },
  )
    .populate("ownerId", "username displayName")
    .populate("permissions.userId", "username displayName")) as PopulatedCalendar;

  return {
    calendar: {
      id: updatedCalendar._id.toString(),
      name: updatedCalendar.name,
      category: updatedCalendar.category,
      ownerId: updatedCalendar.ownerId?._id?.toString(),
      owner: updatedCalendar.ownerId
        ? {
            id: updatedCalendar.ownerId._id.toString(),
            username: updatedCalendar.ownerId.username,
            displayName: updatedCalendar.ownerId.displayName,
          }
        : null,
      permissions: updatedCalendar.permissions.map(perm => ({
        userId: perm.userId._id.toString(),
        accessLevel: perm.accessLevel,
        user: {
          id: perm.userId._id.toString(),
          username: perm.userId.username,
          displayName: perm.userId.displayName,
        },
      })),
      isPublic: updatedCalendar.isPublic,
      createdAt: updatedCalendar.createdAt,
      updatedAt: updatedCalendar.updatedAt,
    },
    message: "Calendar updated successfully",
  };
});
