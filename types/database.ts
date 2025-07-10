// =============================================================================
// DATABASE MODEL INTERFACES
// =============================================================================

import type { IUserApi } from ".";

/**
 * Base interface for all database documents
 */
export interface IBaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
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

/**
 * Calendar permission with populated user
 */
export interface PopulatedCalendarPermission {
  userId: IUserPopulated;
  accessLevel: "view" | "edit";
}

/**
 * Calendar document with populated references
 */
export interface PopulatedCalendar extends Omit<ICalendar, "ownerId" | "permissions"> {
  ownerId?: IUserPopulated;
  permissions: PopulatedCalendarPermission[];
}

/**
 * Event document with populated references
 */
export interface PopulatedEvent extends Omit<IEvent, "calendarId" | "createdBy"> {
  calendarId: PopulatedCalendar;
  createdBy: IUserPopulated;
}

/**
 * View document with populated references
 */
export interface PopulatedView extends Omit<IView, "selectedCalendarIds" | "createdBy"> {
  selectedCalendarIds: PopulatedCalendar[];
  createdBy: IUserPopulated;
}

// =============================================================================
// ROLE AND ACCESS ENUMS
// =============================================================================

export enum AccessLevel {
  VIEW = "view",
  EDIT = "edit",
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isPopulatedCalendar(calendar: ICalendar | PopulatedCalendar): calendar is PopulatedCalendar {
  return typeof calendar.ownerId === "object" && calendar.ownerId !== null;
}

export function isPopulatedEvent(event: IEvent | PopulatedEvent): event is PopulatedEvent {
  return typeof event.calendarId === "object" && event.calendarId !== null;
}

export type { User as IUserApi } from "hksh-nuxt-base-layer/types/auth";

export type IUserPopulated = Pick<IUserApi, "_id" | "name" | "username">;
