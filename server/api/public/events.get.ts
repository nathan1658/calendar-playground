import { Event } from "~/server/models/Event.model";
import { Calendar } from "~/server/models/Calendar.model";

export default defineEventHandler(async () => {
  try {
    // Get only public calendars
    const publicCalendars = await Calendar.find({ isPublic: true }).select("_id").lean();
    const publicCalendarIds = publicCalendars.map(cal => (cal._id as any).toString());

    if (publicCalendarIds.length === 0) {
      return {
        events: [],
        total: 0,
      };
    }

    // Fetch events from public calendars only
    const events = await Event.find({
      calendarId: { $in: publicCalendarIds },
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
      createdBy: evt.createdBy ? {
        id: evt.createdBy._id.toString(),
        username: evt.createdBy.username,
        displayName: evt.createdBy.displayName,
      } : null,
      createdAt: evt.createdAt,
      updatedAt: evt.updatedAt,
    }));

    return {
      events: formattedEvents,
      total: formattedEvents.length,
    };
  } catch (error) {
    console.error("Error fetching public events:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch public events",
    });
  }
});