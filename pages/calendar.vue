<template>
  <div class="calendar-page">
    <VContainer fluid>
      <VRow>
        <!-- Calendar Selection Sidebar -->
        <VCol cols="auto">
          <VCard width="300">
            <VCardItem>
              <VCardTitle>
                <VRow align="center">
                  <VCol>
                    <div class="d-flex align-center ga-2">
                      <VIcon icon="mdi-calendar-multiple" />
                      <div class="text-subtitle-1">Calendars</div>
                      <VSpacer />
                      <VBtn
                        v-if="!allCalendarsSelected"
                        variant="text"
                        size="small"
                        color="primary"
                        @click="selectAllCalendars"
                      >
                        Select All
                      </VBtn>
                      <VBtn
                        v-else
                        variant="text"
                        size="small"
                        color="primary"
                        @click="deselectAllCalendars"
                      >
                        Deselect All
                      </VBtn>
                    </div>
                  </VCol>
                </VRow>
              </VCardTitle>
            </VCardItem>

            <VCardText>
              <VList density="compact">
                <VListItem
                  v-for="calendar in availableCalendars"
                  :key="calendar.id"
                  class="pl-0"
                >
                  <template #prepend>
                    <VCheckbox
                      hide-details
                      class="pr-2"
                      :model-value="selectedCalendarIds.includes(calendar.id)"
                      :color="getCalendarColor(calendar.category)"
                      @update:model-value="toggleCalendar(calendar.id, !!$event)"
                    />
                  </template>
                  <VListItemTitle class="text-body-2">
                    {{ calendar.name }}
                  </VListItemTitle>
                  <VListItemSubtitle v-if="calendar.category">
                    {{ calendar.category }}
                  </VListItemSubtitle>
                  <template #append>
                    <VIcon
                      :color="getCalendarColor(calendar.category)"
                      icon="mdi-circle"
                      size="12"
                    />
                  </template>
                </VListItem>
              </VList>

              <!-- Show message when no calendars selected -->
              <VAlert
                v-if="selectedCalendarIds.length === 0"
                type="info"
                variant="tonal"
                density="compact"
                class="mt-3"
              >
                <VIcon icon="mdi-information" />
                Select calendars to view events
              </VAlert>

              <!-- Show calendar count -->
              <VChip
                v-else
                color="primary"
                variant="tonal"
                size="small"
                class="mt-3"
              >
                {{ selectedCalendarIds.length }} of {{ availableCalendars.length }} selected
              </VChip>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Main Calendar View -->
        <VCol
          cols="12"
          md="8"
          lg="9"
        >
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
                :events="filteredCalendarEvents"
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
      :calendars="editableCalendars"
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

// Reactive state
const calendarRef = ref();
const showEventModal = ref(false);
const selectedEvent = ref<EventData | null>(null);
const modalMode = ref<"create" | "edit">("create");
const calendarEvents = ref<CalendarEvent[]>([]);
const availableCalendars = ref<CalendarOption[]>([]);
const selectedCalendarIds = ref<string[]>([]);
const isLoading = ref(false);
const snackbarStore = useSnackbarStore();

// Default values for new events
const defaultCalendarId = ref("");
const defaultStartTime = ref(new Date());
const defaultEndTime = ref(new Date(Date.now() + 60 * 60 * 1000));
const defaultAllDay = ref(false);

// Computed properties
const allCalendarsSelected = computed(() => {
  return selectedCalendarIds.value.length === availableCalendars.value.length;
});

const editableCalendars = computed(() => {
  // Show calendars the user can edit
  return availableCalendars.value.filter(cal => isAdmin.value || selectedCalendarIds.value.includes(cal.id));
});

const filteredCalendarEvents = computed(() => {
  if (selectedCalendarIds.value.length === 0) {
    return [];
  }
  return calendarEvents.value.filter(event => {
    const calendarId = event.extendedProps?.calendarId;
    return calendarId && selectedCalendarIds.value.includes(calendarId);
  });
});

// Calendar color mapping
const getCalendarColor = (category?: string): string => {
  const colorMap: Record<string, string> = {
    work: "#1976D2",
    personal: "#388E3C",
    meetings: "#F57C00",
    holidays: "#D32F2F",
    projects: "#7B1FA2",
    default: "#3B82F6",
  };
  return colorMap[category || "default"] || colorMap.default;
};

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
    snackbarStore.error("Error", "Failed to load events");
  } finally {
    isLoading.value = false;
  }
};

// Load available calendars
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

    // Initialize with all calendars selected
    selectedCalendarIds.value = availableCalendars.value.map(cal => cal.id);

    if (availableCalendars.value.length > 0) {
      defaultCalendarId.value = availableCalendars.value[0].id;
    }
  } catch {
    snackbarStore.error("Error", "Failed to load calendars");
  }
};

// Calendar selection methods
const toggleCalendar = (calendarId: string, selected: boolean) => {
  if (selected) {
    if (!selectedCalendarIds.value.includes(calendarId)) {
      selectedCalendarIds.value.push(calendarId);
    }
  } else {
    const index = selectedCalendarIds.value.indexOf(calendarId);
    if (index > -1) {
      selectedCalendarIds.value.splice(index, 1);
    }
  }
};

const selectAllCalendars = () => {
  selectedCalendarIds.value = availableCalendars.value.map(cal => cal.id);
};

const deselectAllCalendars = () => {
  selectedCalendarIds.value = [];
};

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
    snackbarStore.success("Success", "Event updated successfully");
    await loadEvents(); // Refresh events
  } catch {
    snackbarStore.error("Error", "Failed to update event");
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
      snackbarStore.success("Success", "Event created successfully");
    } else if (eventData.id) {
      await updateEvent(eventData.id, eventData);
      snackbarStore.success("Success", "Event updated successfully");
    }

    showEventModal.value = false;
    await loadEvents(); // Refresh events
  } catch {
    snackbarStore.error("Error", modalMode.value === "create" ? "Failed to create event" : "Failed to update event");
  } finally {
    isLoading.value = false;
  }
};

const handleEventDelete = async (eventId: string) => {
  try {
    isLoading.value = true;
    await deleteEvent(eventId);
    snackbarStore.success("Success", "Event deleted successfully");
    showEventModal.value = false;
    await loadEvents(); // Refresh events
  } catch {
    snackbarStore.error("Error", "Failed to delete event");
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
.calendar-page {
  height: 100vh;
  overflow: hidden;
}
</style>
