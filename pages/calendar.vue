<template>
  <div class="calendar-page">
    <VContainer fluid>
      <VRow>
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              <VRow align="center">
                <VCol>
                  <h2>Calendar</h2>
                </VCol>
                <VCol cols="auto">
                  <VBtn
                    color="primary"
                    @click="openCreateModal"
                  >
                    <VIcon left>mdi-plus</VIcon>
                    New Event
                  </VBtn>
                </VCol>
              </VRow>
            </VCardTitle>

            <VCardText>
              <CalendarView
                ref="calendarRef"
                :events="calendarEvents"
                :height="600"
                @event-click="handleEventClick"
                @event-drop="handleEventDrop"
                @event-resize="handleEventResize"
                @date-select="handleDateSelect"
              />
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>

    <!-- Event Modal -->
    <EventModal
      v-model="showEventModal"
      :event="selectedEvent"
      :calendars="availableCalendars"
      :mode="modalMode"
      :default-calendar-id="defaultCalendarId"
      :default-start-time="defaultStartTime"
      :default-end-time="defaultEndTime"
      :default-all-day="defaultAllDay"
      @submit="handleEventSubmit"
      @delete="handleEventDelete"
    />

    <!-- Loading overlay -->
    <VOverlay
      v-model="isLoading"
      class="align-center justify-center"
    >
      <VProgressCircular
        color="primary"
        indeterminate
        size="64"
      />
    </VOverlay>

    <!-- Error snackbar -->
    <VSnackbar
      v-model="errorSnackbar"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
      <template #actions>
        <VBtn
          variant="text"
          @click="errorSnackbar = false"
        >
          Close
        </VBtn>
      </template>
    </VSnackbar>

    <!-- Success snackbar -->
    <VSnackbar
      v-model="successSnackbar"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
      <template #actions>
        <VBtn
          variant="text"
          @click="successSnackbar = false"
        >
          Close
        </VBtn>
      </template>
    </VSnackbar>
  </div>
</template>

<script setup lang="ts">
import CalendarView from "~/components/CalendarView.vue";
import EventModal from "~/components/EventModal.vue";
import type { CalendarEvent } from "~/components/CalendarView.vue";
import type { EventData, CalendarOption } from "~/components/EventModal.vue";
import { useEvents } from "~/composables/useEvents";

// Page metadata
definePageMeta({
  title: "Calendar",
  requiresAuth: true,
});

// Composables
const { getAggregatedEvents, createEvent, updateEvent, deleteEvent, formatEventForCalendar, updateEventDates } =
  useEvents();

// Reactive state
const calendarRef = ref();
const showEventModal = ref(false);
const selectedEvent = ref<EventData | null>(null);
const modalMode = ref<"create" | "edit">("create");
const calendarEvents = ref<CalendarEvent[]>([]);
const availableCalendars = ref<CalendarOption[]>([]);
const isLoading = ref(false);
const errorSnackbar = ref(false);
const errorMessage = ref("");
const successSnackbar = ref(false);
const successMessage = ref("");

// Default values for new events
const defaultCalendarId = ref("");
const defaultStartTime = ref(new Date());
const defaultEndTime = ref(new Date(Date.now() + 60 * 60 * 1000));
const defaultAllDay = ref(false);

// Load events on mount
onMounted(async () => {
  await Promise.all([loadEvents(), loadCalendars()]);
});

// Load events from API
const loadEvents = async () => {
  try {
    isLoading.value = true;
    const events = await getAggregatedEvents();
    calendarEvents.value = events.map(formatEventForCalendar);
  } catch {
    showErrorMessage("Failed to load events");
  } finally {
    isLoading.value = false;
  }
};

// Load available calendars
const loadCalendars = async () => {
  try {
    const response = await $fetch<{ calendars: CalendarApiResponse[] }>("/api/calendars");
    availableCalendars.value = response.calendars.map(cal => ({
      id: cal.id,
      name: cal.name,
      category: cal.category || "default",
    }));

    if (availableCalendars.value.length > 0) {
      defaultCalendarId.value = availableCalendars.value[0].id;
    }
  } catch {
    showErrorMessage("Failed to load calendars");
  }
};

// Add interface at the top of the script section
interface CalendarApiResponse {
  id: string;
  name: string;
  category?: string;
}

// Event handlers
const openCreateModal = () => {
  selectedEvent.value = null;
  modalMode.value = "create";
  showEventModal.value = true;
};

const handleEventClick = (event: CalendarEvent) => {
  // Convert CalendarEvent to EventData for editing
  selectedEvent.value = {
    id: event.id,
    subject: event.title,
    description: event.extendedProps?.description,
    calendarId: event.extendedProps?.calendarId || "",
    startTime: new Date(event.start),
    endTime: new Date(event.end),
    allDay: event.allDay || false,
  };
  modalMode.value = "edit";
  showEventModal.value = true;
};

const handleDateSelect = (start: Date, end: Date, allDay: boolean) => {
  defaultStartTime.value = start;
  defaultEndTime.value = end;
  defaultAllDay.value = allDay;
  openCreateModal();
};

const handleEventDrop = async (eventId: string, newStart: Date, newEnd: Date) => {
  try {
    await updateEventDates(eventId, newStart, newEnd);
    showSuccessMessage("Event updated successfully");
    await loadEvents(); // Refresh events
  } catch {
    showErrorMessage("Failed to update event");
    // Revert the change by reloading events
    await loadEvents();
  }
};

const handleEventResize = async (eventId: string, newStart: Date, newEnd: Date) => {
  await handleEventDrop(eventId, newStart, newEnd);
};

const handleEventSubmit = async (eventData: EventData) => {
  try {
    isLoading.value = true;

    if (modalMode.value === "create") {
      await createEvent(eventData);
      showSuccessMessage("Event created successfully");
    } else if (eventData.id) {
      await updateEvent(eventData.id, eventData);
      showSuccessMessage("Event updated successfully");
    }

    showEventModal.value = false;
    await loadEvents(); // Refresh events
  } catch {
    showErrorMessage(modalMode.value === "create" ? "Failed to create event" : "Failed to update event");
  } finally {
    isLoading.value = false;
  }
};

const handleEventDelete = async (eventId: string) => {
  try {
    isLoading.value = true;
    await deleteEvent(eventId);
    showSuccessMessage("Event deleted successfully");
    showEventModal.value = false;
    await loadEvents(); // Refresh events
  } catch {
    showErrorMessage("Failed to delete event");
  } finally {
    isLoading.value = false;
  }
};

// Utility functions
const showErrorMessage = (message: string) => {
  errorMessage.value = message;
  errorSnackbar.value = true;
};

const showSuccessMessage = (message: string) => {
  successMessage.value = message;
  successSnackbar.value = true;
};
</script>

<style scoped>
.calendar-page {
  height: 100vh;
  overflow: hidden;
}
</style>
