import { View } from "~/server/models/View.model";
import { Calendar } from "~/server/models/Calendar.model";
import { requireAdminAuth } from "~/server/utils/auth";
import { z } from "zod";

const updateViewSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  alias: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  selectedCalendarIds: z.array(z.string()).min(1).optional(),
  columnCount: z.number().min(1).max(4).optional(),
  paddingPx: z.number().min(0).max(50).optional(),
});

export default defineEventHandler(async event => {
  await requireAdminAuth(event);
  
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "View ID is required",
    });
  }

  const body = await readBody(event);
  const validatedData = updateViewSchema.parse(body);

  const view = await View.findById(id);
  if (!view) {
    throw createError({
      statusCode: 404,
      statusMessage: "View not found",
    });
  }

  // Check if alias already exists (if being updated)
  if (validatedData.alias && validatedData.alias !== view.alias) {
    const existingView = await View.findOne({ alias: validatedData.alias });
    if (existingView) {
      throw createError({
        statusCode: 400,
        statusMessage: "Alias already exists",
      });
    }
  }

  // Verify calendar IDs exist (if being updated)
  if (validatedData.selectedCalendarIds) {
    const calendars = await Calendar.find({ _id: { $in: validatedData.selectedCalendarIds } });
    if (calendars.length !== validatedData.selectedCalendarIds.length) {
      throw createError({
        statusCode: 400,
        statusMessage: "One or more calendar IDs are invalid",
      });
    }
  }

  // Update the view
  Object.assign(view, validatedData);
  await view.save();

  // Populate the response
  await view.populate("selectedCalendarIds", "name category");
  await view.populate("createdBy", "username displayName");

  return {
    view: {
      id: view._id.toString(),
      name: view.name,
      alias: view.alias,
      selectedCalendarIds: view.selectedCalendarIds.map((cal: { _id: string }) => cal._id.toString()),
      selectedCalendars: view.selectedCalendarIds.map((cal: { _id: string; name: string; category?: string }) => ({
        id: cal._id.toString(),
        name: cal.name,
        category: cal.category,
      })),
      columnCount: view.columnCount,
      paddingPx: view.paddingPx,
      createdBy: {
        id: view.createdBy._id.toString(),
        username: view.createdBy.username,
        displayName: view.createdBy.displayName,
      },
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
    },
  };
});