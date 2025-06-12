import { View } from "~/server/models/View.model";
import { requireAdminAuth } from "~/server/utils/auth";

export default defineEventHandler(async event => {
  await requireAdminAuth(event);
  
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "View ID is required",
    });
  }

  const view = await View.findById(id);
  if (!view) {
    throw createError({
      statusCode: 404,
      statusMessage: "View not found",
    });
  }

  await View.findByIdAndDelete(id);

  return {
    message: "View deleted successfully",
  };
});