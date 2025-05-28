export interface PopulatedUser {
  _id: string;
  username: string;
  displayName?: string;
}

export interface PopulatedCalendar {
  _id: string;
  name: string;
  category?: string;
  ownerId?: PopulatedUser;
  permissions: Array<{
    userId: PopulatedUser;
    accessLevel: "view" | "edit";
  }>;
  createdAt: Date;
  updatedAt: Date;
}
