import { getServerSession } from "#auth";
import type { H3Event } from "h3";

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  roles: string[];
}


export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const session = await getServerSession(event);
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  // Type assertion since we've extended the session interface
  const user = session.user as AuthUser & { name?: string; email?: string; image?: string };
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    roles: user.roles || [],
  };
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

export async function getOptionalAuth(event: H3Event): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(event);
    if (!session?.user) {
      return null;
    }

    const user = session.user as AuthUser & { name?: string; email?: string; image?: string };
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      roles: user.roles || [],
    };
  } catch {
    return null;
  }
}
