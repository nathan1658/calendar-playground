import type { EventData } from "~/components/EventModal.vue";
import type { CalendarEvent } from "~/components/CalendarView.vue";

export interface EventFilters {
  start?: string;
  end?: string;
  category?: string;
  search?: string;
  calendarIds?: string;
}

export interface EventResponse {
  id: string;
  calendarId: string;
  subject: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AggregatedEventResponse {
  id: string;
  calendar: {
    id: string;
    name: string;
    category?: string;
  };
  subject: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  createdBy: {
    id: string;
    username: string;
    displayName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const useEvents = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Create a new event
  const createEvent = async (eventData: EventData): Promise<EventResponse | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<{ event: EventResponse }>("/api/events", {
        method: "POST",
        body: {
          calendarId: eventData.calendarId,
          subject: eventData.subject,
          description: eventData.description,
          startTime: eventData.startTime.toISOString(),
          endTime: eventData.endTime.toISOString(),
          allDay: eventData.allDay,
        },
      });

      return response.event;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to create event";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Update an existing event
  const updateEvent = async (eventId: string, eventData: Partial<EventData>): Promise<EventResponse | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const body: any = {};
      if (eventData.subject !== undefined) body.subject = eventData.subject;
      if (eventData.description !== undefined) body.description = eventData.description;
      if (eventData.startTime !== undefined) body.startTime = eventData.startTime.toISOString();
      if (eventData.endTime !== undefined) body.endTime = eventData.endTime.toISOString();
      if (eventData.allDay !== undefined) body.allDay = eventData.allDay;

      const response = await $fetch<{ event: EventResponse }>(`/api/events/${eventId}`, {
        method: "PUT",
        body,
      });

      return response.event;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to update event";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      await $fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      error.value = err.data?.message || "Failed to delete event";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Get a single event by ID
  const getEvent = async (eventId: string): Promise<AggregatedEventResponse | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await $fetch<{ event: AggregatedEventResponse }>(`/api/events/${eventId}`);
      return response.event;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to fetch event";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Get events for a specific calendar
  const getCalendarEvents = async (
    calendarId: string,
    filters?: Pick<EventFilters, "start" | "end">,
  ): Promise<EventResponse[]> => {
    try {
      isLoading.value = true;
      error.value = null;

      const query = new URLSearchParams();
      if (filters?.start) query.append("start", filters.start);
      if (filters?.end) query.append("end", filters.end);

      const response = await $fetch<{ events: EventResponse[] }>(
        `/api/events/calendar/${calendarId}?${query.toString()}`,
      );
      return response.events;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to fetch calendar events";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Get aggregated events from all accessible calendars
  const getAggregatedEvents = async (filters?: EventFilters): Promise<AggregatedEventResponse[]> => {
    try {
      isLoading.value = true;
      error.value = null;

      const query = new URLSearchParams();
      if (filters?.start) query.append("start", filters.start);
      if (filters?.end) query.append("end", filters.end);
      if (filters?.category) query.append("category", filters.category);
      if (filters?.search) query.append("search", filters.search);
      if (filters?.calendarIds) query.append("calendarIds", filters.calendarIds);

      const response = await $fetch<{ events: AggregatedEventResponse[] }>(
        `/api/events/aggregated?${query.toString()}`,
      );
      return response.events;
    } catch (err: any) {
      error.value = err.data?.message || "Failed to fetch events";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Convert API response to CalendarEvent format
  const formatEventForCalendar = (event: AggregatedEventResponse): CalendarEvent => {
    return {
      id: event.id,
      title: event.subject,
      start: event.startTime,
      end: event.endTime,
      allDay: event.allDay,
      backgroundColor: getCalendarColor(event.calendar.category),
      borderColor: getCalendarColor(event.calendar.category),
      extendedProps: {
        description: event.description,
        calendarId: event.calendar.id,
        calendarName: event.calendar.name,
        createdBy: event.createdBy,
      },
    };
  };

  // Convert API response to EventData format
  const formatEventForModal = (event: AggregatedEventResponse): EventData => {
    return {
      id: event.id,
      subject: event.subject,
      description: event.description,
      calendarId: event.calendar.id,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      allDay: event.allDay,
    };
  };

  // Get calendar color based on category
  const getCalendarColor = (category?: string): string => {
    const colors: Record<string, string> = {
      work: "#1976D2",
      personal: "#388E3C",
      family: "#F57C00",
      health: "#D32F2F",
      education: "#7B1FA2",
      travel: "#00796B",
      social: "#E64A19",
      finance: "#5D4037",
      default: "#3B82F6",
    };

    return colors[category || "default"] || colors.default;
  };

  // Update event dates (for drag and drop)
  const updateEventDates = async (eventId: string, startTime: Date, endTime: Date): Promise<void> => {
    await updateEvent(eventId, {
      startTime,
      endTime,
    });
  };

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getCalendarEvents,
    getAggregatedEvents,
    formatEventForCalendar,
    formatEventForModal,
    updateEventDates,
  };
};
