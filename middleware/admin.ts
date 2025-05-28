export default defineNuxtRouteMiddleware(async () => {
  const { status, data, getSession } = useAuth();

  // If status is loading, wait for session to be fetched
  if (status.value === "loading") {
    try {
      await getSession();
    } catch (error) {
      console.log("Admin middleware - failed to get session:", error);
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }
  }

  if (status.value !== "authenticated") {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  // Check admin role - cast session data to access user properties
  const sessionData = data.value as unknown as { user: { roles: string[] } };
  if (!sessionData?.user?.roles?.includes("admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin privileges required",
    });
  }
});
