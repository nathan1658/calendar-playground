import { Calendar } from "~/server/models/Calendar.model";
import { requireAuth } from "~/server/utils/auth";
import type { PopulatedCalendar } from "~/server/utils/types";

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
  const calendar = (await Calendar.findById(calendarId)
    .populate("ownerId", "username displayName")
    .populate("permissions.userId", "username displayName")) as PopulatedCalendar | null;

  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Calendar not found",
    });
  }

  // Check permissions: admin can view any calendar, users need explicit permission
  const hasPermission =
    currentUser.roles.includes("admin") ||
    calendar.permissions.some(
      perm =>
        perm.userId._id.toString() === currentUser.id && (perm.accessLevel === "view" || perm.accessLevel === "edit"),
    );

  if (!hasPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied to this calendar",
    });
  }

  return {
    calendar: {
      id: calendar._id.toString(),
      name: calendar.name,
      category: calendar.category,
      ownerId: calendar.ownerId?._id?.toString(),
      owner: calendar.ownerId
        ? {
            id: calendar.ownerId._id.toString(),
            username: calendar.ownerId.username,
            displayName: calendar.ownerId.displayName,
          }
        : null,
      permissions: calendar.permissions.map(perm => ({
        userId: perm.userId._id.toString(),
        accessLevel: perm.accessLevel,
        user: {
          id: perm.userId._id.toString(),
          username: perm.userId.username,
          displayName: perm.userId.displayName,
        },
      })),
      createdAt: calendar.createdAt,
      updatedAt: calendar.updatedAt,
    },
  };
});
