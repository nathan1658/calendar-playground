import { z } from "zod";
import { Event } from "~/server/models/Event.model";
import { Calendar } from "~/server/models/Calendar.model";
import { requireAuth } from "~/server/utils/auth";
import { getUserAccessibleCalendarIds } from "~/server/utils/permissions";

const querySchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  calendarIds: z.string().optional(), // Comma-separated calendar IDs
});

export default defineEventHandler(async event => {
  try {
    // Require authentication
    const currentUser = await requireAuth(event);

    const query = getQuery(event);
    const { start, end, category, search, calendarIds } = querySchema.parse(query);

    // Get accessible calendar IDs
    let accessibleCalendarIds = await getUserAccessibleCalendarIds(currentUser);

    // Filter by specific calendar IDs if provided
    if (calendarIds) {
      const requestedIds = calendarIds.split(",").map(id => id.trim());
      accessibleCalendarIds = accessibleCalendarIds.filter(id => requestedIds.includes(id));
    }

    // Filter by category if provided
    if (category) {
      const calendarFilter: any = { _id: { $in: accessibleCalendarIds }, category };
      // Get calendars matching the category filter
      const filteredCalendars = await Calendar.find(calendarFilter, "_id");
      accessibleCalendarIds = filteredCalendars.map(cal => cal._id.toString());
    }

    // Build date filter for events
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

    // Build text search filter
    let textFilter = {};
    if (search) {
      textFilter = {
        $or: [{ subject: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }],
      };
    }

    // Fetch events from accessible calendars
    const events = await Event.find({
      calendarId: { $in: accessibleCalendarIds },
      ...dateFilter,
      ...textFilter,
    })
      .populate("calendarId", "name category")
      .populate("createdBy", "username displayName")
      .sort({ startTime: 1 });

    const formattedEvents = events.map(evt => ({
      id: evt._id.toString(),
      calendar: {
        id: evt.calendarId._id.toString(),
        name: evt.calendarId.name,
        category: evt.calendarId.category,
      },
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
      filters: {
        start,
        end,
        category,
        search,
        calendarIds: accessibleCalendarIds,
      },
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
