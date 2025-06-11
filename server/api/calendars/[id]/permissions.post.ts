import { Calendar } from "~/server/models/Calendar.model";
import { User } from "~/server/models/User.model";
import { requireAdminAuth } from "~/server/utils/auth";
import { addPermissionSchema, type AddPermissionInput } from "~/types/validation";
import type { PopulatedCalendar, ICalendarPermission } from "~/types/database";

export default defineEventHandler(async event => {
  // Require admin authentication
  await requireAdminAuth(event);

  const calendarId = getRouterParam(event, "id");

  if (!calendarId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Calendar ID is required",
    });
  }

  const body = await readBody(event);
  const { userId, accessLevel } = addPermissionSchema.parse(body);

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
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

  // Check if permission already exists
  const existingPermission = calendar.permissions.find(
    (perm: ICalendarPermission) => perm.userId.toString() === userId,
  );

  if (existingPermission) {
    // Update existing permission
    existingPermission.accessLevel = accessLevel;
  } else {
    // Add new permission
    calendar.permissions.push({ userId, accessLevel });
  }

  await calendar.save();

  // Return updated calendar with populated fields
  const updatedCalendar = (await Calendar.findById(calendarId)
    .populate("ownerId", "username displayName")
    .populate("permissions.userId", "username displayName")) as PopulatedCalendar;

  return {
    message: existingPermission ? "Permission updated successfully" : "Permission added successfully",
    calendar: {
      id: updatedCalendar._id.toString(),
      name: updatedCalendar.name,
      category: updatedCalendar.category,
      permissions: updatedCalendar.permissions.map(perm => ({
        userId: perm.userId._id.toString(),
        accessLevel: perm.accessLevel,
        user: {
          id: perm.userId._id.toString(),
          username: perm.userId.username,
          displayName: perm.userId.displayName,
        },
      })),
    },
  };
});
