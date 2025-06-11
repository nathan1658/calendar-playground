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

export async function requireCalendarAccess(
  calendarId: string,
  user: AuthUser | null,
  requiredLevel: "view" | "edit" = "view",
): Promise<void> {
  const calendar = await Calendar.findById(calendarId);
  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Calendar not found",
    });
  }

  // If calendar is public and only view access is required, allow access
  if (calendar.isPublic && requiredLevel === "view") {
    return;
  }

  // For edit access or private calendars, require authentication
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  // Admin users have access to all calendars
  if (user.roles.includes("admin")) {
    return;
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

export async function getPublicCalendarIds(): Promise<string[]> {
  const publicCalendars = await Calendar.find({ isPublic: true }, "_id");
  return publicCalendars.map(cal => cal._id.toString());
}

export async function getAllAccessibleCalendarIds(user: AuthUser | null): Promise<string[]> {
  if (!user) {
    // Return only public calendars for unauthenticated users
    return await getPublicCalendarIds();
  }

  // Admin users have access to all calendars
  if (user.roles.includes("admin")) {
    const allCalendars = await Calendar.find({}, "_id");
    return allCalendars.map(cal => cal._id.toString());
  }

  // Find calendars where user is owner, has permissions, or calendar is public
  const calendars = await Calendar.find({
    $or: [
      { ownerId: user.id },
      { "permissions.userId": user.id },
      { isPublic: true },
    ],
  });

  return calendars.map(cal => cal._id.toString());
}
