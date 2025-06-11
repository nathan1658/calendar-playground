import { Event } from "~/server/models/Event.model";
import { getOptionalAuth } from "~/server/utils/auth";
import { requireCalendarAccess } from "~/server/utils/permissions";
import { eventsQuerySchema, type EventsQueryInput } from "~/types/validation";

export default defineEventHandler(async event => {
  try {
    // Get optional authentication
    const currentUser = await getOptionalAuth(event);

    const calendarId = getRouterParam(event, "calendarId");
    if (!calendarId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Calendar ID is required",
      });
    }

    // Check if user has view access to the calendar (including public access)
    await requireCalendarAccess(calendarId, currentUser, "view");

    const query = getQuery(event);
    const { start, end } = eventsQuerySchema.parse(query);

    // Build date filter
    let dateFilter = {};
    if (start || end) {
      dateFilter = {
        $or: [
          // Events that start within the range
          ...(start && end
            ? [{ startTime: { $gte: new Date(start), $lte: new Date(end) } }]
            : start
            ? [{ startTime: { $gte: new Date(start) } }]
            : end
            ? [{ startTime: { $lte: new Date(end) } }]
            : []),
          // Events that end within the range
          ...(start && end
            ? [{ endTime: { $gte: new Date(start), $lte: new Date(end) } }]
            : start
            ? [{ endTime: { $gte: new Date(start) } }]
            : end
            ? [{ endTime: { $lte: new Date(end) } }]
            : []),
          // Events that span the entire range
          ...(start && end ? [{ startTime: { $lte: new Date(start) }, endTime: { $gte: new Date(end) } }] : []),
        ],
      };
    }

    // Fetch events for the calendar
    const events = await Event.find({
      calendarId,
      ...dateFilter,
    })
      .populate("createdBy", "username displayName")
      .sort({ startTime: 1 });

    const formattedEvents = events.map(evt => ({
      id: evt._id.toString(),
      calendarId: evt.calendarId.toString(),
      subject: evt.subject,
      description: evt.description,
      startTime: evt.startTime,
      endTime: evt.endTime,
      allDay: evt.allDay,
      createdBy: {
        id: evt.createdBy._id.toString(),
        username: evt.createdBy.username,
        displayName: evt.createdBy.displayName,
      },
      createdAt: evt.createdAt,
      updatedAt: evt.updatedAt,
    }));

    return {
      events: formattedEvents,
      total: formattedEvents.length,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid query parameters",
      });
    }
    throw error;
  }
});
