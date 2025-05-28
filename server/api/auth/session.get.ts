import jwt from "jsonwebtoken";
import { User } from "~/server/models/User.model";

interface JWTPayload {
  userId: string;
  username: string;
  roles: string[];
}

export default defineEventHandler(async event => {
  try {
    const config = useRuntimeConfig();

    // Debug: log all cookies received
    const allCookies = parseCookies(event);
    console.log("Session endpoint - all cookies received:", allCookies);

    const token = getRequestHeader(event, "Authorization")?.split(" ")[1];
    console.log("Session endpoint - auth-token cookie:", token ? "exists" : "not found");

    console.log("Token:", token);
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "No authentication token found",
      });
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, config.authSecret) as JWTPayload;

    // Get fresh user data from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "User not found",
      });
    }

    console.log("Session endpoint - successfully authenticated user:", user.username);

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        roles: user.roles,
      },
    };
  } catch (error: unknown) {
    console.error("Session endpoint - error:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")) {
      // Clear invalid token
      deleteCookie(event, "auth-token");
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid or expired token",
      });
    }
    throw error;
  }
});
