import type { IUserApi } from "~/types";

export async function fetchAllUsers(): Promise<IUserApi[]> {
  try {
    let users: IUserApi[] = [];
    let page = 1;
    while (true) {
      const response = await $fetch("/api/users", { query: { limit: 100, page: page } });
      users = users.concat(response.data);
      if (!response.pagination.hasNextPage) {
        break;
      } else {
        page++;
      }
    }
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}
