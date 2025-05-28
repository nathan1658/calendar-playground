import { z } from "zod";
import { Event } from "~/server/models/Event.model";
import { requireAuth } from "~/server/utils/auth";
import { requireCalendarPermission } from "~/server/utils/permissions";

const updateEventSchema = z.object({
  subject: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
});

export default defineEventHandler(async event => {
  try {
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

    const body = await readBody(event);
    const updateData = updateEventSchema.parse(body);

    // Update the event
    const updatedFields: any = {};
    if (updateData.subject !== undefined) updatedFields.subject = updateData.subject;
    if (updateData.description !== undefined) updatedFields.description = updateData.description;
    if (updateData.startTime !== undefined) updatedFields.startTime = new Date(updateData.startTime);
    if (updateData.endTime !== undefined) updatedFields.endTime = new Date(updateData.endTime);
    if (updateData.allDay !== undefined) updatedFields.allDay = updateData.allDay;

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedFields, {
      new: true,
      runValidators: true,
    })
      .populate("calendarId", "name category")
      .populate("createdBy", "username displayName");

    return {
      event: {
        id: updatedEvent!._id.toString(),
        calendar: {
          id: updatedEvent!.calendarId._id.toString(),
          name: updatedEvent!.calendarId.name,
          category: updatedEvent!.calendarId.category,
        },
        subject: updatedEvent!.subject,
        description: updatedEvent!.description,
        startTime: updatedEvent!.startTime,
        endTime: updatedEvent!.endTime,
        allDay: updatedEvent!.allDay,
        createdBy: {
          id: updatedEvent!.createdBy._id.toString(),
          username: updatedEvent!.createdBy.username,
          displayName: updatedEvent!.createdBy.displayName,
        },
        createdAt: updatedEvent!.createdAt,
        updatedAt: updatedEvent!.updatedAt,
      },
      message: "Event updated successfully",
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
