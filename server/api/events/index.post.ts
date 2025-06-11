import { Event } from "~/server/models/Event.model";
import { requireAuth } from "~/server/utils/auth";
import { requireCalendarPermission } from "~/server/utils/permissions";
import { createEventSchema, type CreateEventInput } from "~/types/validation";

export default defineEventHandler(async event => {
  try {
    // Require authentication
    const currentUser = await requireAuth(event);

    const body = await readBody(event);
    const { calendarId, subject, description, startTime, endTime, allDay } = createEventSchema.parse(body);

    // Check if user has edit permission on the calendar
    await requireCalendarPermission(calendarId, currentUser, "edit");

    // Convert date strings to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Create new event
    const newEvent = new Event({
      calendarId,
      subject,
      description,
      startTime: startDate,
      endTime: endDate,
      allDay,
      createdBy: currentUser.id,
    });

    await newEvent.save();

    return {
      event: {
        id: newEvent._id.toString(),
        calendarId: newEvent.calendarId.toString(),
        subject: newEvent.subject,
        description: newEvent.description,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        allDay: newEvent.allDay,
        createdBy: newEvent.createdBy.toString(),
        createdAt: newEvent.createdAt,
        updatedAt: newEvent.updatedAt,
      },
      message: "Event created successfully",
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid input data",
      });
    }
    throw error;
  }
});
