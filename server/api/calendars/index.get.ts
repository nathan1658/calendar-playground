import { Calendar } from "~/server/models/Calendar.model";
import { requireAuth } from "~/server/utils/auth";
import type { PopulatedCalendar } from "~/server/utils/types";

export default defineEventHandler(async event => {
  // Require authentication
  const currentUser = await requireAuth(event);

  let calendars;

  if (currentUser.roles.includes("admin")) {
    // Admin can see all calendars
    calendars = (await Calendar.find()
      .populate("ownerId", "username displayName")
      .populate("permissions.userId", "username displayName")
      .sort({ createdAt: -1 })) as PopulatedCalendar[];
  } else {
    // Regular users can only see calendars they have permission for
    calendars = (await Calendar.find({
      "permissions.userId": currentUser.id,
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
      createdAt: calendar.createdAt,
      updatedAt: calendar.updatedAt,
    })),
  };
});
