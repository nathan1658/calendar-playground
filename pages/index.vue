<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="dashboard-title">
            {{ isAdmin ? "All Calendars" : "My Calendar" }}
          </h1>
          <p class="dashboard-subtitle">Manage your events and schedule</p>
        </div>
        <VBtn
          color="primary"
          variant="flat"
          prepend-icon="mdi-plus"
          class="create-btn"
          @click="openCreateEventModal"
        >
          New Event
        </VBtn>
      </div>
    </div>

    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">Filters</h3>
          <FilterPanel
            v-model="activeFilters"
            :calendars="availableCalendars"
            :loading="isLoading"
            class="filter-panel"
            @apply="handleFilterChange"
            @clear="handleFilterClear"
          />
        </div>
      </aside>

      <!-- Main Calendar Area -->
      <main class="main-content">
        <div class="calendar-container">
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
        </div>
      </main>
    </div>

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
      class="loading-overlay"
    >
      <div class="loading-content">
        <VProgressCircular
          color="primary"
          indeterminate
          size="32"
          width="3"
        />
        <p class="loading-text">Loading...</p>
      </div>
    </VOverlay>

  </div>
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
const snackbarStore = useSnackbarStore();

// Animation state (keeping for future use)
const animatedTotalEvents = ref(0);
const animatedActiveUsers = ref(0);
const animatedRevenue = ref(0);
const animatedConversion = ref(0);

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

// Animation functions
const animateValue = (ref: Ref<number>, targetValue: number, duration = 2000) => {
  const startValue = ref.value;
  const startTime = Date.now();

  const animate = () => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);

    ref.value = Math.round(startValue + (targetValue - startValue) * easeOutQuart);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

const startCounterAnimations = () => {
  nextTick(() => {
    animateValue(animatedTotalEvents, 2847, 2500);
    animateValue(animatedActiveUsers, 1234, 2200);
    animateValue(animatedRevenue, 45678, 2800);
    animateValue(animatedConversion, 3.2, 2000);
  });
};

// Real-time counter updates
const updateRealTimeCounters = () => {
  // Simulate small fluctuations in real-time data
  const eventDelta = Math.floor(Math.random() * 10) - 5;
  const userDelta = Math.floor(Math.random() * 5) - 2;
  const revenueDelta = Math.floor(Math.random() * 1000) - 500;
  const conversionDelta = Math.random() * 0.2 - 0.1;

  animateValue(animatedTotalEvents, 2847 + eventDelta, 1000);
  animateValue(animatedActiveUsers, 1234 + userDelta, 1000);
  animateValue(animatedRevenue, 45678 + revenueDelta, 1000);
  animateValue(animatedConversion, Math.max(0, 3.2 + conversionDelta), 1000);
};

// Set up real-time updates every 30 seconds
let realTimeInterval: NodeJS.Timeout | null = null;

const startRealTimeUpdates = () => {
  if (realTimeInterval) clearInterval(realTimeInterval);
  realTimeInterval = setInterval(updateRealTimeCounters, 30000);
};

const stopRealTimeUpdates = () => {
  if (realTimeInterval) {
    clearInterval(realTimeInterval);
    realTimeInterval = null;
  }
};

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
    snackbarStore.error("Error", "Failed to load calendars");
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
    snackbarStore.error("Error", "Failed to load events");
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
    snackbarStore.success("Success", "Event updated successfully");
    await loadEvents();
  } catch {
    snackbarStore.error("Error", "Failed to update event");
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
      snackbarStore.success("Success", "Event created successfully");
    } else if (selectedEvent.value?.id) {
      await updateEvent(selectedEvent.value.id, eventData);
      snackbarStore.success("Success", "Event updated successfully");
    }
    showEventModal.value = false;
    await loadEvents();
  } catch {
    snackbarStore.error("Error", `Failed to ${modalMode.value} event`);
  }
};

const handleEventDelete = async (eventId: string) => {
  try {
    await deleteEvent(eventId);
    snackbarStore.success("Success", "Event deleted successfully");
    showEventModal.value = false;
    await loadEvents();
  } catch {
    snackbarStore.error("Error", "Failed to delete event");
  }
};

// Utility functions

// Lifecycle
onMounted(async () => {
  await loadCalendars();
  await loadEvents();

  // Start counter animations after a short delay
  setTimeout(() => {
    startCounterAnimations();
  }, 300);

  // Start real-time updates
  startRealTimeUpdates();
});

onUnmounted(() => {
  stopRealTimeUpdates();
});
</script>

<style scoped>
/* Reset and Base Styles */
.dashboard {
  min-height: 100vh;
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Header */
.dashboard-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 24px 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-section {
  flex: 1;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.dashboard-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.create-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  padding: 0 20px;
  height: 40px;
}

/* Main Content Layout */
.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  align-items: start;
}

/* Sidebar */
.sidebar {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  position: sticky;
  top: 120px;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.filter-panel {
  /* Remove any custom styling to let the component handle its own appearance */
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.calendar-container {
  padding: 24px;
}

/* Loading States */
.loading-overlay {
  background-color: rgba(255, 255, 255, 0.9);
}

.loading-content {
  text-align: center;
  color: #374151;
}

.loading-text {
  margin: 12px 0 0 0;
  font-size: 14px;
  font-weight: 500;
}

/* Notifications */
.notification-snackbar {
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .sidebar {
    position: static;
    order: 2;
  }

  .main-content {
    order: 1;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .dashboard-content {
    padding: 24px 16px;
    gap: 16px;
  }

  .sidebar {
    padding: 16px;
  }

  .calendar-container {
    padding: 16px;
  }

  .dashboard-title {
    font-size: 24px;
  }
}

/* Remove all complex animations and effects */
* {
  transition: none !important;
  animation: none !important;
  backdrop-filter: none !important;
  transform: none !important;
}

/* Simple hover states only */
.create-btn:hover {
  opacity: 0.9;
}

.sidebar:hover,
.main-content:hover {
  border-color: #d1d5db;
}

/* Focus states for accessibility */
.create-btn:focus {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
