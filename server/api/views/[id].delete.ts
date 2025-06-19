import { View } from "~/server/models/View.model";

export default defineEventHandler(async event => {
  await requireAdminAuthentication(event);

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
