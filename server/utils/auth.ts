import jwt from "jsonwebtoken";
import type { H3Event } from "h3";
import { User } from "~/server/models/User.model";

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  roles: string[];
}

interface JWTPayload {
  userId: string;
  username: string;
  roles: string[];
}

export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const config = useRuntimeConfig();
  const token = getCookie(event, "auth-token");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  try {
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

    return {
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      roles: user.roles,
    };
  } catch (error: unknown) {
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
}

export function requireAdmin(user: AuthUser): void {
  if (!user.roles.includes("admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin privileges required",
    });
  }
}

export async function requireAdminAuth(event: H3Event): Promise<AuthUser> {
  const user = await requireAuth(event);
  requireAdmin(user);
  return user;
}
