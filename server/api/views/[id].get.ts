import { View } from "~/server/models/View.model";
import type { PopulatedView } from "~/types/database";

export default defineEventHandler(async event => {
  await requireAdminAuthentication(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "View ID is required",
    });
  }

  const view = (await View.findById(id)
    .populate("selectedCalendarIds", "name category")
    .populate("createdBy", "username name")) as PopulatedView | null;

  if (!view) {
    throw createError({
      statusCode: 404,
      statusMessage: "View not found",
    });
  }

  return {
    view: {
      id: view._id.toString(),
      name: view.name,
      alias: view.alias,
      selectedCalendarIds: view.selectedCalendarIds.map(cal => cal._id.toString()),
      selectedCalendars: view.selectedCalendarIds.map(cal => ({
        id: cal._id.toString(),
        name: cal.name,
        category: cal.category,
      })),
      columnCount: view.columnCount,
      paddingPx: view.paddingPx,
      createdBy: view.createdBy,
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
    },
  };
});
