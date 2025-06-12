// =============================================================================
// DATABASE MODEL INTERFACES
// =============================================================================

/**
 * Base interface for all database documents
 */
export interface IBaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User document interface
 */
export interface IUser extends IBaseDocument {
  username: string;
  password: string;
  displayName?: string;
  roles: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Calendar permission interface
 */
export interface ICalendarPermission {
  userId: string;
  accessLevel: "view" | "edit";
}

/**
 * Calendar document interface
 */
export interface ICalendar extends IBaseDocument {
  name: string;
  category?: string;
  ownerId?: string;
  permissions: ICalendarPermission[];
  isPublic: boolean;
}

/**
 * Event document interface
 */
export interface IEvent extends IBaseDocument {
  calendarId: string;
  subject: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  createdBy: string;
}

/**
 * View document interface
 */
export interface IView extends IBaseDocument {
  name: string;
  alias: string;
  selectedCalendarIds: string[];
  columnCount: number;
  paddingPx: number;
  createdBy: string;
}

// =============================================================================
// POPULATED DOCUMENT INTERFACES
// =============================================================================

/**
 * User document with minimal fields (for population)
 */
export interface PopulatedUser {
  _id: string;
  username: string;
  displayName?: string;
}

/**
 * Calendar permission with populated user
 */
export interface PopulatedCalendarPermission {
  userId: PopulatedUser;
  accessLevel: "view" | "edit";
}

/**
 * Calendar document with populated references
 */
export interface PopulatedCalendar extends Omit<ICalendar, 'ownerId' | 'permissions'> {
  ownerId?: PopulatedUser;
  permissions: PopulatedCalendarPermission[];
}

/**
 * Event document with populated references
 */
export interface PopulatedEvent extends Omit<IEvent, 'calendarId' | 'createdBy'> {
  calendarId: PopulatedCalendar;
  createdBy: PopulatedUser;
}

/**
 * View document with populated references
 */
export interface PopulatedView extends Omit<IView, 'selectedCalendarIds' | 'createdBy'> {
  selectedCalendarIds: PopulatedCalendar[];
  createdBy: PopulatedUser;
}

// =============================================================================
// ROLE AND ACCESS ENUMS
// =============================================================================

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum AccessLevel {
  VIEW = "view",
  EDIT = "edit",
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isPopulatedCalendar(calendar: ICalendar | PopulatedCalendar): calendar is PopulatedCalendar {
  return typeof calendar.ownerId === 'object' && calendar.ownerId !== null;
}

export function isPopulatedEvent(event: IEvent | PopulatedEvent): event is PopulatedEvent {
  return typeof event.calendarId === 'object' && event.calendarId !== null;
}