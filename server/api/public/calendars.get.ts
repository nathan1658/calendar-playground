import { Calendar } from "~/server/models/Calendar.model";

export default defineEventHandler(async () => {
  try {

    // Only return public calendars for non-authenticated users
    const calendars = await Calendar.find({ isPublic: true })
      .select("name category")
      .lean();

    return {
      calendars: calendars.map(cal => ({
        id: (cal._id as any).toString(),
        name: cal.name,
        category: cal.category,
      })),
    };
  } catch (error) {
    console.error("Error fetching public calendars:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch public calendars",
    });
  }
});