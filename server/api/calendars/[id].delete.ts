import { Calendar } from "~/server/models/Calendar.model";
import { requireAdminAuth } from "~/server/utils/auth";

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

  // Find and delete calendar
  const calendar = await Calendar.findByIdAndDelete(calendarId);

  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Calendar not found",
    });
  }

  return {
    message: "Calendar deleted successfully",
    deletedCalendar: {
      id: calendar._id.toString(),
      name: calendar.name,
    },
  };
});
