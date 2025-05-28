import { z } from "zod";
import jwt from "jsonwebtoken";
import { User } from "~/server/models/User.model";

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event);
    const { username, password } = loginSchema.parse(body);

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

    // Create JWT token
    const config = useRuntimeConfig();
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        roles: user.roles,
      },
      config.authSecret,
      {
        expiresIn: "7d",
        issuer: "calendar-app",
      },
    );

    // Set HTTP-only cookie
    setCookie(event, "auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        roles: user.roles,
      },
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid input data",
      });
    }
    throw error;
  }
});
