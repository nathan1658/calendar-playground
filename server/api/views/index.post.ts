import { View } from "~/server/models/View.model";
import { Calendar } from "~/server/models/Calendar.model";
import { requireAdminAuth } from "~/server/utils/auth";
import { z } from "zod";

const createViewSchema = z.object({
  name: z.string().min(1).max(100),
  alias: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  selectedCalendarIds: z.array(z.string()).min(1),
  columnCount: z.number().min(1).max(4),
  paddingPx: z.number().min(0).max(50),
});

export default defineEventHandler(async event => {
  const currentUser = await requireAdminAuth(event);
  const body = await readBody(event);

  // Validate request body
  const validatedData = createViewSchema.parse(body);

  // Check if alias already exists
  const existingView = await View.findOne({ alias: validatedData.alias });
  if (existingView) {
    throw createError({
      statusCode: 400,
      statusMessage: "Alias already exists",
    });
  }

  // Verify all calendar IDs exist
  const calendars = await Calendar.find({ _id: { $in: validatedData.selectedCalendarIds } });
  if (calendars.length !== validatedData.selectedCalendarIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "One or more calendar IDs are invalid",
    });
  }

  // Create the view
  const view = new View({
    name: validatedData.name,
    alias: validatedData.alias,
    selectedCalendarIds: validatedData.selectedCalendarIds,
    columnCount: validatedData.columnCount,
    paddingPx: validatedData.paddingPx,
    createdBy: currentUser.id,
  });

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