import { Event } from "~/server/models/Event.model";
import { requireAuth } from "~/server/utils/auth";
import { requireCalendarPermission } from "~/server/utils/permissions";

export default defineEventHandler(async event => {
  // Require authentication
  const currentUser = await requireAuth(event);

  const eventId = getRouterParam(event, "eventId");
  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID is required",
    });
  }

  // Find the event
  const foundEvent = await Event.findById(eventId);
  if (!foundEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: "Event not found",
    });
  }

  // Check if user has edit permission on the calendar
  await requireCalendarPermission(foundEvent.calendarId.toString(), currentUser, "edit");

  // Delete the event
  await Event.findByIdAndDelete(eventId);

  return {
    message: "Event deleted successfully",
  };
});
