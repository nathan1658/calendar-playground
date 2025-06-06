import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      displayName?: string;
      roles: string[];
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    displayName?: string;
    roles: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    displayName?: string;
    roles?: string[];
  }
}
