export default defineEventHandler(async event => {
  // Clear the auth token cookie
  deleteCookie(event, "auth-token");

  return {
    message: "Logged out successfully",
  };
});
