import type { IEvent, PopulatedCalendar, IUserPopulated } from "./database";

// =============================================================================
// CALENDAR API TYPES
// =============================================================================

export interface CalendarResponse {
  id: string;
  name: string;
  category?: string;
  ownerId?: string;
  owner?: IUserPopulated | null;
  permissions: Array<{
    userId: string;
    accessLevel: "view" | "edit";
    user: IUserPopulated;
  }>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarsListResponse {
  calendars: CalendarResponse[];
}

export interface CreateCalendarRequest {
  name: string;
  category?: string;
  ownerId?: string;
  isPublic?: boolean;
}

export interface UpdateCalendarRequest {
  name?: string;
  category?: string;
  isPublic?: boolean;
}

export interface CalendarCreateResponse {
  calendar: CalendarResponse;
  message: string;
}

export interface CalendarUpdateResponse {
  calendar: CalendarResponse;
  message: string;
}

export interface CalendarGetResponse {
  calendar: CalendarResponse;
}

export interface AddPermissionRequest {
  userId: string;
  accessLevel: "view" | "edit";
}

export interface PermissionResponse {
  message: string;
}

// =============================================================================
// EVENT API TYPES
// =============================================================================

export interface EventResponse {
  id: string;
  calendarId: string;
  subject: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  createdBy: IUserPopulated;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrichedEventResponse extends EventResponse {
  calendar: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface EventsListResponse {
  events: EventResponse[];
  total: number;
}

export interface AggregatedEventsResponse {
  events: EnrichedEventResponse[];
  total: number;
  filters: {
    start?: string;
    end?: string;
    category?: string;
    search?: string;
    calendarIds: string[];
  };
}

export interface CreateEventRequest {
  calendarId: string;
  subject: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
}

export interface UpdateEventRequest {
  subject?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
}

export interface EventCreateResponse {
  event: EventResponse;
  message: string;
}

export interface EventUpdateResponse {
  event: EventResponse;
  message: string;
}

export interface EventGetResponse {
  event: EventResponse;
}

// =============================================================================
// QUERY PARAMETER TYPES
// =============================================================================

export interface EventsQuery {
  start?: string;
  end?: string;
}

export interface AggregatedEventsQuery {
  start?: string;
  end?: string;
  category?: string;
  search?: string;
  calendarIds?: string; // Comma-separated
}

// =============================================================================
// ERROR RESPONSE TYPES
// =============================================================================

export interface ErrorResponse {
  statusCode: number;
  statusMessage: string;
  message?: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  statusCode: 400;
  statusMessage: "Invalid input data" | "Invalid query parameters";
  details?: Record<string, string[]>;
}

export interface AuthErrorResponse extends ErrorResponse {
  statusCode: 401;
  statusMessage: "Authentication required";
}

export interface ForbiddenErrorResponse extends ErrorResponse {
  statusCode: 403;
  statusMessage: string;
}

export interface NotFoundErrorResponse extends ErrorResponse {
  statusCode: 404;
  statusMessage: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ApiResponse<T> = T | ErrorResponse;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// =============================================================================
// TYPE CONVERSION UTILITIES
// =============================================================================

export function toCalendarResponse(calendar: PopulatedCalendar): CalendarResponse {
  return {
    id: calendar._id.toString(),
    name: calendar.name,
    category: calendar.category,
    ownerId: calendar.ownerId?._id?.toString(),
    owner: calendar.ownerId,
    permissions: calendar.permissions.map(perm => ({
      userId: perm.userId._id.toString(),
      accessLevel: perm.accessLevel,
      user: perm.userId,
    })),
    isPublic: calendar.isPublic,
    createdAt: calendar.createdAt,
    updatedAt: calendar.updatedAt,
  };
}

export function toEventResponse(event: IEvent, createdBy: IUserPopulated): EventResponse {
  return {
    id: event._id.toString(),
    calendarId: event.calendarId.toString(),
    subject: event.subject,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    allDay: event.allDay,
    createdBy: createdBy,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}
