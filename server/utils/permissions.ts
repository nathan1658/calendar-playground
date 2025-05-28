import { Calendar } from "~/server/models/Calendar.model";
import type { AuthUser } from "./auth";
import type { ICalendarPermission } from "~/server/models/Calendar.model";

export async function requireCalendarPermission(
  calendarId: string,
  user: AuthUser,
  requiredLevel: "view" | "edit" = "view",
): Promise<void> {
  // Admin users have access to all calendars
  if (user.roles.includes("admin")) {
    return;
  }

  const calendar = await Calendar.findById(calendarId);
  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Calendar not found",
    });
  }

  // Check if user is the owner
  if (calendar.ownerId?.toString() === user.id) {
    return;
  }

  // Check user permissions
  const userPermission = calendar.permissions.find((p: ICalendarPermission) => p.userId.toString() === user.id);

  if (!userPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: "You don't have access to this calendar",
    });
  }

  // If edit is required but user only has view access
  if (requiredLevel === "edit" && userPermission.accessLevel === "view") {
    throw createError({
      statusCode: 403,
      statusMessage: "You don't have edit permissions for this calendar",
    });
  }
}

export async function getUserAccessibleCalendarIds(user: AuthUser): Promise<string[]> {
  // Admin users have access to all calendars
  if (user.roles.includes("admin")) {
    const allCalendars = await Calendar.find({}, "_id");
    return allCalendars.map(cal => cal._id.toString());
  }

  // Find calendars where user is owner or has permissions
  const calendars = await Calendar.find({
    $or: [{ ownerId: user.id }, { "permissions.userId": user.id }],
  });

  return calendars.map(cal => cal._id.toString());
}
