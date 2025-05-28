import { User } from "~/server/models/User.model";
import { requireAdminAuth } from "~/server/utils/auth";

export default defineEventHandler(async event => {
  // Require admin authentication
  await requireAdminAuth(event);

  // Fetch all users (excluding password)
  const users = await User.find({}, { password: 0 }).sort({ username: 1 });

  return {
    users: users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      roles: user.roles,
    })),
  };
});
