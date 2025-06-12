import { View } from "~/server/models/View.model";
import type { PopulatedView } from "~/types/database";

export default defineEventHandler(async event => {
  const alias = getRouterParam(event, "alias");
  if (!alias) {
    throw createError({
      statusCode: 400,
      statusMessage: "View alias is required",
    });
  }

  const view = (await View.findOne({ alias })
    .populate("selectedCalendarIds", "name category")) as PopulatedView | null;

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
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
    },
  };
});