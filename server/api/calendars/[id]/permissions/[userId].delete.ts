import { Calendar } from "~/server/models/Calendar.model";
import type { PopulatedCalendar, ICalendarPermission } from "~/types";

export default defineEventHandler(async event => {
  // Require admin authentication
  await requireAdminAuthentication(event);

  const calendarId = getRouterParam(event, "id");
  const userId = getRouterParam(event, "userId");

  if (!calendarId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Calendar ID is required",
    });
  }

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  // Find calendar
  const calendar = await Calendar.findById(calendarId);
  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Calendar not found",
    });
  }

  // Find and remove permission
  const permissionIndex = calendar.permissions.findIndex(
    (perm: ICalendarPermission) => perm.userId.toString() === userId,
  );

  if (permissionIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: "Permission not found for this user",
    });
  }

  calendar.permissions.splice(permissionIndex, 1);
  await calendar.save();

  // Return updated calendar with populated fields
  const updatedCalendar = (await Calendar.findById(calendarId)
    .populate("ownerId", "username name")
    .populate("permissions.userId", "username name")) as PopulatedCalendar;

  return {
    message: "Permission removed successfully",
    calendar: {
      id: updatedCalendar._id.toString(),
      name: updatedCalendar.name,
      category: updatedCalendar.category,
      permissions: updatedCalendar.permissions.map(perm => ({
        userId: perm.userId._id.toString(),
        accessLevel: perm.accessLevel,
        user: perm.userId,
      })),
    },
  };
});
