// =============================================================================
// FRONTEND COMPONENT INTERFACES
// =============================================================================

/**
 * Base props interface for modal components
 */
export interface BaseModalProps {
  modelValue: boolean;
}

/**
 * Base emits interface for modal components  
 */
export interface BaseModalEmits {
  (e: "update:modelValue", value: boolean): void;
}

// =============================================================================
// EVENT MODAL INTERFACES
// =============================================================================

/**
 * Form data structure for event creation/editing
 */
export interface EventFormData {
  subject: string;
  description: string;
  calendarId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
}

/**
 * Event data structure for passing to components
 */
export interface EventData {
  id?: string;
  subject: string;
  description?: string;
  calendarId: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

/**
 * Props for EventModal component
 */
export interface EventModalProps extends BaseModalProps {
  event?: EventData | null;
  calendars: CalendarOption[];
  mode?: "create" | "edit";
  defaultCalendarId?: string;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
  defaultAllDay?: boolean;
}

/**
 * Emits for EventModal component
 */
export interface EventModalEmits extends BaseModalEmits {
  (e: "submit", data: EventData): void;
  (e: "delete", eventId: string): void;
}

// =============================================================================
// CALENDAR INTERFACES
// =============================================================================

/**
 * Calendar option for select dropdowns
 */
export interface CalendarOption {
  id: string;
  name: string;
  category?: string;
  isPublic?: boolean;
}

/**
 * Calendar event structure for FullCalendar
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  extendedProps: {
    description?: string;
    calendarId: string;
    calendarName: string;
    category?: string;
    createdBy: string;
  };
}

/**
 * Calendar view data
 */
export interface CalendarViewData {
  id: string;
  name: string;
  category?: string;
  owner?: {
    id: string;
    username: string;
    displayName?: string;
  };
  isPublic: boolean;
  userAccess?: "view" | "edit" | "owner";
}

// =============================================================================
// FILTER INTERFACES
// =============================================================================

/**
 * Filter options for events
 */
export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  search?: string;
  selectedCalendarIds: string[];
  category?: string;
}

/**
 * Props for FilterPanel component
 */
export interface FilterPanelProps {
  calendars: CalendarOption[];
  modelValue: FilterOptions;
  loading?: boolean;
}

/**
 * Emits for FilterPanel component
 */
export interface FilterPanelEmits {
  (e: "update:modelValue" | "apply", filters: FilterOptions): void;
  (e: "clear"): void;
}

// =============================================================================
// ADMIN INTERFACES
// =============================================================================

/**
 * User data for admin interfaces
 */
export interface AdminUserData {
  id: string;
  username: string;
  displayName?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Calendar data for admin interfaces
 */
export interface AdminCalendarData {
  id: string;
  name: string;
  category?: string;
  isPublic?: boolean;
  owner?: {
    id: string;
    username: string;
    displayName?: string;
  };
  permissions: Array<{
    userId: string;
    accessLevel: "view" | "edit";
    user: {
      id: string;
      username: string;
      displayName?: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission data for calendar permissions dialog
 */
export interface CalendarPermissionData {
  userId: string;
  accessLevel: "view" | "edit";
  user: {
    id: string;
    username: string;
    displayName?: string;
  };
}

/**
 * Props for admin dialogs
 */
export interface AdminDialogProps extends BaseModalProps {
  loading?: boolean;
}

/**
 * Props for creation dialogs
 */
export interface CreateDialogProps extends AdminDialogProps {
  // No additional props needed
}

/**
 * Props for edit dialogs
 */
export interface EditDialogProps<T> extends AdminDialogProps {
  item: T | null;
}

/**
 * Emits for admin creation dialogs
 */
export interface CreateDialogEmits extends BaseModalEmits {
  (e: "created"): void;
}

/**
 * Emits for admin edit dialogs
 */
export interface EditDialogEmits extends BaseModalEmits {
  (e: "updated"): void;
}

// =============================================================================
// USER AVATAR INTERFACES
// =============================================================================

/**
 * Props for UserAvatar component
 */
export interface UserAvatarProps {
  user: {
    username: string;
    displayName?: string;
  };
  size?: "small" | "default" | "large" | "x-large";
  showName?: boolean;
  showTooltip?: boolean;
}

// =============================================================================
// TABLE INTERFACES
// =============================================================================

/**
 * Generic table header definition
 */
export interface TableHeader {
  title: string;
  key: string;
  sortable?: boolean;
  width?: string | number;
  align?: "start" | "center" | "end";
}

/**
 * Table action item
 */
export interface TableAction {
  icon: string;
  label: string;
  color?: string;
  disabled?: boolean;
  handler: () => void;
}

// =============================================================================
// FORM INTERFACES
// =============================================================================

/**
 * Base form validation rule
 */
export type ValidationRule = (value: any) => boolean | string;

/**
 * Form field definition
 */
export interface FormField {
  key: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "date" | "time" | "datetime" | "textarea" | "select" | "checkbox";
  required?: boolean;
  rules?: ValidationRule[];
  options?: Array<{ value: any; text: string }>;
  placeholder?: string;
  hint?: string;
}

// =============================================================================
// NOTIFICATION INTERFACES
// =============================================================================

/**
 * Notification/alert data
 */
export interface NotificationData {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title?: string;
  message: string;
  timeout?: number;
  actions?: Array<{
    label: string;
    handler: () => void;
  }>;
}

// =============================================================================
// COMPOSABLE RETURN TYPES
// =============================================================================

/**
 * Return type for data loading composables
 */
export interface LoadingState<T> {
  data: Ref<T | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  refresh: () => Promise<void>;
}

/**
 * Return type for CRUD composables
 */
export interface CrudState<T> extends LoadingState<T[]> {
  create: (item: Partial<T>) => Promise<void>;
  update: (id: string, item: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  getById: (id: string) => Promise<T | null>;
}

// =============================================================================
// THEME AND UI INTERFACES
// =============================================================================

/**
 * Theme configuration
 */
export interface ThemeConfig {
  dark: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    warning: string;
    info: string;
    success: string;
  };
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  showSidebar: boolean;
  sidebarCollapsed: boolean;
  showAppBar: boolean;
  contentPadding: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make specified properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract keys that have string values
 */
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

/**
 * Extract keys that have function values
 */
export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];