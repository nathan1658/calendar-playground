import { Calendar } from "~/server/models/Calendar.model";
import { getOptionalAuth } from "~/server/utils/auth";
import type { PopulatedCalendar } from "~/types/database";

export default defineEventHandler(async event => {
  // Get optional authentication (null if not authenticated)
  const currentUser = await getOptionalAuth(event);

  let calendars;

  if (!currentUser) {
    // Unauthenticated users can only see public calendars
    calendars = (await Calendar.find({ isPublic: true })
      .populate("ownerId", "username displayName")
      .populate("permissions.userId", "username displayName")
      .sort({ createdAt: -1 })) as PopulatedCalendar[];
  } else if (currentUser.roles.includes("admin")) {
    // Admin can see all calendars
    calendars = (await Calendar.find()
      .populate("ownerId", "username displayName")
      .populate("permissions.userId", "username displayName")
      .sort({ createdAt: -1 })) as PopulatedCalendar[];
  } else {
    // Regular users can see calendars they have permission for + public calendars
    calendars = (await Calendar.find({
      $or: [
        { "permissions.userId": currentUser.id },
        { ownerId: currentUser.id },
        { isPublic: true },
      ],
    })
      .populate("ownerId", "username displayName")
      .populate("permissions.userId", "username displayName")
      .sort({ createdAt: -1 })) as PopulatedCalendar[];
  }

  return {
    calendars: calendars.map(calendar => ({
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
      isPublic: calendar.isPublic,
      createdAt: calendar.createdAt,
      updatedAt: calendar.updatedAt,
    })),
  };
});
