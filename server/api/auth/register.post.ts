import { z } from "zod";
import { User } from "~/server/models/User.model";

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  displayName: z.string().optional(),
  roles: z.array(z.enum(["admin", "user"])).default(["user"]),
});

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event);
    const { username, password, displayName, roles } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "Username already exists",
      });
    }

    // Create new user
    const user = new User({
      username,
      password,
      displayName,
      roles,
    });

    await user.save();

    return {
      message: "User created successfully",
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
    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: "Username already exists",
      });
    }
    throw error;
  }
});
