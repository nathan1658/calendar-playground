import { Event } from "~/server/models/Event.model";
import { requireCalendarPermission } from "~/server/utils/permissions";

export default defineEventHandler(async event => {
  // Require authentication
  const currentUser = await requireAuthentication(event);

  const eventId = getRouterParam(event, "eventId");
  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID is required",
    });
  }

  // Find the event
  const foundEvent = await Event.findById(eventId)
    .populate("calendarId", "name category")
    .populate("createdBy", "username name");

  if (!foundEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: "Event not found",
    });
  }

  // Check if user has view permission on the calendar
  await requireCalendarPermission(foundEvent.calendarId._id.toString(), currentUser, "view");

  return {
    event: {
      id: foundEvent._id.toString(),
      calendar: {
        id: foundEvent.calendarId._id.toString(),
        name: foundEvent.calendarId.name,
        category: foundEvent.calendarId.category,
      },
      subject: foundEvent.subject,
      description: foundEvent.description,
      startTime: foundEvent.startTime,
      endTime: foundEvent.endTime,
      allDay: foundEvent.allDay,
      createdBy: foundEvent.createdBy,
      createdAt: foundEvent.createdAt,
      updatedAt: foundEvent.updatedAt,
    },
  };
});
