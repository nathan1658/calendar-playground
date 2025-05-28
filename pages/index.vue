<template>
  <VContainer fluid>
    <VRow>
      <!-- Filter Panel Sidebar -->
      <VCol
        cols="12"
        lg="3"
        xl="2"
      >
        <FilterPanel
          v-model="activeFilters"
          :calendars="availableCalendars"
          :loading="isLoading"
          @apply="handleFilterChange"
          @clear="handleFilterClear"
        />
      </VCol>

      <!-- Main Calendar View -->
      <VCol
        cols="12"
        lg="9"
        xl="10"
      >
        <VCard>
          <VCardTitle>
            <VRow align="center">
              <VCol>
                <VIcon
                  icon="mdi-calendar-multiple"
                  class="mr-2"
                />
                {{ isAdmin ? "All Calendars Dashboard" : "My Calendar Dashboard" }}
              </VCol>
              <VCol cols="auto">
                <VBtn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="openCreateEventModal"
                >
                  New Event
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>

          <VCardText>
            <!-- Statistics Row -->
            <VRow class="mb-4">
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <VCard
                  variant="outlined"
                  color="primary"
                >
                  <VCardText class="text-center">
                    <VIcon
                      icon="mdi-calendar-multiple"
                      size="40"
                      class="mb-2"
                    />
                    <div class="text-h6">{{ availableCalendars.length }}</div>
                    <div class="text-caption">Available Calendars</div>
                  </VCardText>
                </VCard>
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <VCard
                  variant="outlined"
                  color="success"
                >
                  <VCardText class="text-center">
                    <VIcon
                      icon="mdi-calendar-check"
                      size="40"
                      class="mb-2"
                    />
                    <div class="text-h6">{{ filteredEventCount }}</div>
                    <div class="text-caption">Visible Events</div>
                  </VCardText>
                </VCard>
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <VCard
                  variant="outlined"
                  color="info"
                >
                  <VCardText class="text-center">
                    <VIcon
                      icon="mdi-calendar-today"
                      size="40"
                      class="mb-2"
                    />
                    <div class="text-h6">{{ todayEventCount }}</div>
                    <div class="text-caption">Today's Events</div>
                  </VCardText>
                </VCard>
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <VCard
                  variant="outlined"
                  color="warning"
                >
                  <VCardText class="text-center">
                    <VIcon
                      icon="mdi-calendar-week"
                      size="40"
                      class="mb-2"
                    />
                    <div class="text-h6">{{ thisWeekEventCount }}</div>
                    <div class="text-caption">This Week</div>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>

            <!-- Calendar Component -->
            <CalendarView
              ref="calendarRef"
              :events="calendarEvents"
              :height="600"
              @event-click="handleEventClick"
              @event-drop="handleEventDrop"
              @event-resize="handleEventResize"
              @date-select="handleDateSelect"
              @view-change="handleViewChange"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Event Modal -->
    <EventModal
      v-model="showEventModal"
      :event="selectedEvent"
      :calendars="editableCalendars"
      :mode="modalMode"
      :default-calendar-id="defaultCalendarId"
      :default-start-time="defaultStartTime"
      :default-end-time="defaultEndTime"
      :default-all-day="defaultAllDay"
      @submit="handleEventSubmit"
      @delete="handleEventDelete"
    />

    <!-- Loading Overlay -->
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

    <!-- Snackbars -->
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
  </VContainer>
</template>

<script setup lang="ts">
import CalendarView from "~/components/CalendarView.vue";
import EventModal from "~/components/EventModal.vue";
import FilterPanel from "~/components/FilterPanel.vue";
import type { CalendarEvent } from "~/components/CalendarView.vue";
import type { EventData, CalendarOption } from "~/components/EventModal.vue";
import type { FilterOptions } from "~/components/FilterPanel.vue";
import { useEvents } from "~/composables/useEvents";

// Page metadata
definePageMeta({
  title: "Calendar Dashboard",
  requiresAuth: true,
});

// Auth
const { data } = useAuth();

// User information
const currentUser = computed(() => {
  const sessionData = data.value as unknown as {
    user: {
      id: string;
      username: string;
      displayName?: string;
      roles: string[];
    };
  } | null;

  return sessionData?.user || null;
});

const isAdmin = computed(() => currentUser.value?.roles?.includes("admin") || false);

// Composables
const { getAggregatedEvents, createEvent, updateEvent, deleteEvent, formatEventForCalendar, updateEventDates } =
  useEvents();

// State
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

// Filter state
const activeFilters = ref<FilterOptions>({
  startDate: "",
  endDate: "",
  search: "",
  selectedCalendarIds: [],
  category: "",
});

// Default values for new events
const defaultCalendarId = ref("");
const defaultStartTime = ref(new Date());
const defaultEndTime = ref(new Date(Date.now() + 60 * 60 * 1000));
const defaultAllDay = ref(false);

// Computed properties
const editableCalendars = computed(() =>
  availableCalendars.value.filter(
    cal =>
      // Show calendars the user can edit (for admins, all calendars; for users, only their editable ones)
      isAdmin.value || activeFilters.value.selectedCalendarIds.includes(cal.id),
  ),
);

const filteredEventCount = computed(() => calendarEvents.value.length);

const todayEventCount = computed(() => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  return calendarEvents.value.filter(event => {
    const eventStart = new Date(event.start).toISOString().split("T")[0];
    const eventEnd = new Date(event.end).toISOString().split("T")[0];
    return eventStart <= todayStr && eventEnd >= todayStr;
  }).length;
});

const thisWeekEventCount = computed(() => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return calendarEvents.value.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      (eventStart >= weekStart && eventStart <= weekEnd) ||
      (eventEnd >= weekStart && eventEnd <= weekEnd) ||
      (eventStart <= weekStart && eventEnd >= weekEnd)
    );
  }).length;
});

// Methods
const loadCalendars = async () => {
  try {
    interface CalendarApiResponse {
      id: string;
      name: string;
      category?: string;
    }

    const response = await $fetch<{ calendars: CalendarApiResponse[] }>("/api/calendars");
    availableCalendars.value = response.calendars.map(cal => ({
      id: cal.id,
      name: cal.name,
      category: cal.category || "default",
    }));

    // Initialize filter with all calendars selected
    if (activeFilters.value.selectedCalendarIds.length === 0) {
      activeFilters.value.selectedCalendarIds = availableCalendars.value.map(cal => cal.id);
    }

    if (availableCalendars.value.length > 0) {
      defaultCalendarId.value = availableCalendars.value[0].id;
    }
  } catch {
    showErrorMessage("Failed to load calendars");
  }
};

const loadEvents = async () => {
  try {
    isLoading.value = true;

    // Build filter object for API
    interface EventFilters {
      start?: string;
      end?: string;
      search?: string;
      category?: string;
      calendarIds?: string;
    }

    const filters: EventFilters = {};
    if (activeFilters.value.startDate) filters.start = new Date(activeFilters.value.startDate).toISOString();
    if (activeFilters.value.endDate) filters.end = new Date(activeFilters.value.endDate).toISOString();
    if (activeFilters.value.search) filters.search = activeFilters.value.search;
    if (activeFilters.value.category) filters.category = activeFilters.value.category;
    if (activeFilters.value.selectedCalendarIds.length > 0) {
      filters.calendarIds = activeFilters.value.selectedCalendarIds.join(",");
    }

    const events = await getAggregatedEvents(filters);
    calendarEvents.value = events.map(formatEventForCalendar);
  } catch {
    showErrorMessage("Failed to load events");
  } finally {
    isLoading.value = false;
  }
};

// Event handlers
const handleFilterChange = () => {
  loadEvents();
};

const handleFilterClear = () => {
  loadEvents();
};

const openCreateEventModal = () => {
  selectedEvent.value = null;
  modalMode.value = "create";
  showEventModal.value = true;
};

const handleEventClick = (event: CalendarEvent) => {
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
  openCreateEventModal();
};

const handleEventDrop = async (eventId: string, newStart: Date, newEnd: Date) => {
  try {
    await updateEventDates(eventId, newStart, newEnd);
    showSuccessMessage("Event updated successfully");
    await loadEvents();
  } catch {
    showErrorMessage("Failed to update event");
    calendarRef.value?.refetchEvents();
  }
};

const handleEventResize = async (eventId: string, newStart: Date, newEnd: Date) => {
  await handleEventDrop(eventId, newStart, newEnd);
};

const handleViewChange = (view: string) => {
  // Could be used for view-specific logic
  console.log("Calendar view changed to:", view);
};

const handleEventSubmit = async (eventData: EventData) => {
  try {
    if (modalMode.value === "create") {
      await createEvent(eventData);
      showSuccessMessage("Event created successfully");
    } else if (selectedEvent.value?.id) {
      await updateEvent(selectedEvent.value.id, eventData);
      showSuccessMessage("Event updated successfully");
    }
    showEventModal.value = false;
    await loadEvents();
  } catch {
    showErrorMessage(`Failed to ${modalMode.value} event`);
  }
};

const handleEventDelete = async (eventId: string) => {
  try {
    await deleteEvent(eventId);
    showSuccessMessage("Event deleted successfully");
    showEventModal.value = false;
    await loadEvents();
  } catch {
    showErrorMessage("Failed to delete event");
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

// Lifecycle
onMounted(async () => {
  await loadCalendars();
  await loadEvents();
});
</script>

<style scoped>
.text-disabled {
  opacity: 0.6;
}
</style>
