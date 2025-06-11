<template>
  <VContainer fluid class="pa-6">
    <!-- Top Action Bar -->
    <VRow class="mb-6">
      <VCol>
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon
              icon="mdi-calendar-multiple"
              size="24"
              class="mr-3 text-primary"
            />
            <h1 class="text-h5 font-weight-bold text-grey-darken-3">
              {{ isAdmin ? "All Calendars Dashboard" : "My Calendar Dashboard" }}
            </h1>
          </div>
          <div class="d-flex align-center gap-3">
            <!-- Quick Actions -->
            <VBtn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateEventModal"
            >
              New Event
            </VBtn>
          </div>
        </div>
      </VCol>
    </VRow>


    <!-- Main Content Area -->
    <VRow>
      <!-- Left Sidebar - Filters -->
      <VCol cols="12" lg="3">
        <BaseCard title="Quick Actions" icon="mdi-flash" class="mb-4">
          <VBtn
            color="primary"
            variant="elevated"
            block
            prepend-icon="mdi-plus"
            class="mb-3"
            @click="openCreateEventModal"
          >
            New Event
          </VBtn>
        </BaseCard>

        <FilterPanel
          v-model="activeFilters"
          :calendars="availableCalendars"
          :loading="isLoading"
          @apply="handleFilterChange"
          @clear="handleFilterClear"
        />
      </VCol>

      <!-- Right Side - Main Content -->
      <VCol cols="12" lg="9">
        <!-- Calendar Overview Card -->
        <BaseCard title="Calendar Overview" icon="mdi-calendar" class="mb-4">
          <CalendarView
            ref="calendarRef"
            :events="calendarEvents"
            :height="400"
            @event-click="handleEventClick"
            @event-drop="handleEventDrop"
            @event-resize="handleEventResize"
            @date-select="handleDateSelect"
            @view-change="handleViewChange"
          />
        </BaseCard>
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

    <!-- Loading States -->
    <template v-if="isLoading">
      <LoadingSkeleton type="stats" />
      <VRow>
        <VCol cols="12" lg="3">
          <LoadingSkeleton type="actions" />
        </VCol>
        <VCol cols="12" lg="9">
          <LoadingSkeleton type="calendar" />
          <LoadingSkeleton type="activity" />
        </VCol>
      </VRow>
    </template>
    
    <!-- Loading Overlay for operations -->
    <VOverlay
      v-model="isLoading"
      class="align-center justify-center"
      opacity="0.8"
    >
      <div class="text-center">
        <VProgressCircular
          color="primary"
          indeterminate
          size="64"
          width="4"
        />
        <div class="mt-4 text-h6 font-weight-medium">Loading...</div>
        <div class="text-body-2 text-grey">Please wait while we fetch your data</div>
      </div>
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
import LoadingSkeleton from "~/components/LoadingSkeleton.vue";
import BaseCard from "~/components/base/BaseCard.vue";
import type { CalendarEvent } from "~/components/CalendarView.vue";
import type { EventData, CalendarOption } from "~/components/EventModal.vue";
import type { FilterOptions } from "~/components/FilterPanel.vue";
import { useEvents } from "~/composables/useEvents";
import { useToast } from "~/composables/useToast";

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
const { success: showSuccessToast, error: showErrorToast } = useToast();

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
  const conversionDelta = (Math.random() * 0.2) - 0.1;
  
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
  showErrorToast('Error', message);
  errorMessage.value = message;
  errorSnackbar.value = true;
};

const showSuccessMessage = (message: string) => {
  showSuccessToast('Success', message);
  successMessage.value = message;
  successSnackbar.value = true;
};


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
.text-disabled {
  opacity: 0.6;
}

/* Statistics Card Enhancements */
.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.stat-card:hover::before {
  left: 100%;
}

.stat-avatar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-card:hover .stat-avatar {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.progress-bar {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover .progress-bar {
  transform: scaleX(1.02);
}

/* Quick Actions Card */
.quick-actions-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-actions-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.15);
}

/* Performance Card */
.performance-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.performance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

/* Activity Card */
.activity-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* List Item Enhancements */
:deep(.v-list-item) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin: 4px 8px;
}

:deep(.v-list-item:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
  transform: translateX(8px);
}

:deep(.v-list-item .v-avatar) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-list-item:hover .v-avatar) {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Chip Enhancements */
:deep(.v-chip) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-chip:hover) {
  transform: scale(1.05);
}

/* Button Group Time Period */
.time-period-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.time-period-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.time-period-btn:hover::before {
  opacity: 1;
}

/* Floating Action Elements */
.floating-element {
  position: relative;
  z-index: 1;
}

.floating-element::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.floating-element:hover::after {
  opacity: 1;
}

/* Cursor Enhancement */
.cursor-pointer {
  cursor: pointer;
}

/* Responsive Animations */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .stat-avatar,
  .progress-bar,
  .quick-actions-card,
  .performance-card {
    transition: none !important;
    animation: none !important;
  }
}

/* Loading States */
.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Pulse Effect for Real-time Data */
.real-time-indicator {
  position: relative;
}

.real-time-indicator::before {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Glass morphism for cards */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Stagger animation enhancement */
.stagger-item {
  opacity: 0;
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
.stagger-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
