import CredentialsProvider from "next-auth/providers/credentials";
import { NuxtAuthHandler } from "#auth";
import { User } from "~/server/models/User.model";
import type { User as NextAuthUser } from "next-auth";
import { loginSchema, type LoginInput } from "~/types/validation";

export default NuxtAuthHandler({
  pages: {
    signIn: "/login",
  },
  secret: useRuntimeConfig().authSecret ?? "some-secret-key",

  callbacks: {
    jwt: async ({ token, user }) => {
      console.log("jwt", token, user);
      const isSignIn = user ? true : false;
      if (isSignIn && user) {
        token.id = user.id;
        token.username = user.username;
        token.displayName = user.displayName;
        token.roles = user.roles;
      }

      return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
      console.log("session", session, token);
      const user = {
        id: token.id || "",
        username: token.username || "",
        email: token.email,
        displayName: token.displayName,
        roles: token.roles || [],
      };
      session.user = user;
      return Promise.resolve(session);
    },
  },

  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"username" | "password", string> | undefined): Promise<NextAuthUser | null> {
        if (!credentials) {
          throw createError({
            statusCode: 401,
            statusMessage: "No credentials provided",
          });
        }

        console.log("credentials", credentials);
        const { username, password } = loginSchema.parse(credentials);

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
          throw createError({
            statusCode: 401,
            statusMessage: "Invalid credentials",
          });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
          throw createError({
            statusCode: 401,
            statusMessage: "Invalid credentials",
          });
        }

        const loggedInUser: NextAuthUser = {
          id: user._id.toString(),
          username: user.username,
          displayName: user.displayName,
          roles: user.roles,
        };

        return loggedInUser;
      },
    }),
  ],
});
