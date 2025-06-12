import { View } from "~/server/models/View.model";
import { requireAdminAuth } from "~/server/utils/auth";
import type { PopulatedView } from "~/types/database";

export default defineEventHandler(async event => {
  // Only admins can manage views
  await requireAdminAuth(event);

  const views = (await View.find()
    .populate("selectedCalendarIds", "name category")
    .populate("createdBy", "username displayName")
    .sort({ createdAt: -1 })) as PopulatedView[];

  return {
    views: views.map(view => ({
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
      createdBy: {
        id: view.createdBy._id.toString(),
        username: view.createdBy.username,
        displayName: view.createdBy.displayName,
      },
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
    })),
  };
});