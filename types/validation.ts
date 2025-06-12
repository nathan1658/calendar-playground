import { z } from "zod";

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

// =============================================================================
// USER SCHEMAS
// =============================================================================

export const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  displayName: z.string().min(1).max(100),
  password: z.string().min(6),
  roles: z.array(z.enum(["admin", "user"])).min(1),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  roles: z.array(z.enum(["admin", "user"])).optional(),
});

// =============================================================================
// CALENDAR SCHEMAS
// =============================================================================

export const createCalendarSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  category: z.string().max(50).trim().optional(),
  ownerId: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const updateCalendarSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  category: z.string().max(50).trim().optional(),
  isPublic: z.boolean().optional(),
});

export const addPermissionSchema = z.object({
  userId: z.string(),
  accessLevel: z.enum(["view", "edit"]),
});

// =============================================================================
// EVENT SCHEMAS
// =============================================================================

export const createEventSchema = z.object({
  calendarId: z.string().min(1),
  subject: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  allDay: z.boolean().default(false),
});

export const updateEventSchema = z.object({
  subject: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
});

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

export const eventsQuerySchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
});

export const aggregatedEventsQuerySchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  calendarIds: z.string().optional(), // Comma-separated calendar IDs
});

// =============================================================================
// TYPE EXPORTS (inferred from schemas)
// =============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCalendarInput = z.infer<typeof createCalendarSchema>;
export type UpdateCalendarInput = z.infer<typeof updateCalendarSchema>;
export type AddPermissionInput = z.infer<typeof addPermissionSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventsQueryInput = z.infer<typeof eventsQuerySchema>;
export type AggregatedEventsQueryInput = z.infer<typeof aggregatedEventsQuerySchema>;