import { Calendar } from "~/server/models/Calendar.model";
import { requireCalendarAccess } from "~/server/utils/permissions";
import type { PopulatedCalendar } from "~/types/database";

export default defineEventHandler(async event => {
  const currentUser = await optionalAuthentication(event);
  const calendarId = getRouterParam(event, "id");

  if (!calendarId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Calendar ID is required",
    });
  }

  // Check calendar access (handles both public and private calendars)
  await requireCalendarAccess(calendarId, currentUser, "view");

  // Find calendar
  const calendar = (await Calendar.findById(calendarId)
    .populate("ownerId", "username name")
    .populate("permissions.userId", "username name")) as PopulatedCalendar | null;

  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Calendar not found",
    });
  }

  return {
    calendar: {
      id: calendar._id.toString(),
      name: calendar.name,
      category: calendar.category,
      ownerId: calendar.ownerId?._id?.toString(),
      owner: calendar.ownerId,
      permissions: calendar.permissions.map(perm => ({
        userId: perm.userId._id.toString(),
        accessLevel: perm.accessLevel,
        user: perm.userId,
      })),
      isPublic: calendar.isPublic,
      createdAt: calendar.createdAt,
      updatedAt: calendar.updatedAt,
    },
  };
});
