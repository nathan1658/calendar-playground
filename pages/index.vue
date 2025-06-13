<template>
  <div class="calendar-page">
    <VContainer fluid>
      <!-- Top Toolbar -->
      <VCard
        v-if="isAdmin"
        class="mb-4"
      >
        <VCardText>
          <VRow
            align="center"
            dense
          >
            <!-- Calendar Selection -->
            <VCol
              cols="12"
              sm="6"
              md="4"
            >
              <VSelect
                v-model="selectedCalendarIds"
                :items="availableCalendars"
                item-title="name"
                item-value="id"
                label="Select Calendars"
                multiple
                chips
                closable-chips
                density="compact"
                variant="outlined"
              >
                <template #prepend-item>
                  <VListItem @click="toggleAllCalendars">
                    <template #prepend>
                      <VCheckbox
                        :model-value="allCalendarsSelected"
                        :indeterminate="someCalendarsSelected && !allCalendarsSelected"
                        color="primary"
                      />
                    </template>
                    <VListItemTitle>
                      {{ allCalendarsSelected ? "Deselect All" : "Select All" }}
                    </VListItemTitle>
                  </VListItem>
                  <VDivider />
                </template>
              </VSelect>
            </VCol>

            <!-- Column Count -->
            <VCol
              cols="6"
              sm="3"
              md="2"
            >
              <VSelect
                v-model="columnCount"
                :items="columnOptions"
                label="Columns"
                density="compact"
                variant="outlined"
              />
            </VCol>

            <!-- Padding -->
            <VCol
              cols="6"
              sm="3"
              md="2"
            >
              <VTextField
                v-model.number="paddingPx"
                label="Padding (px)"
                type="number"
                min="0"
                max="50"
                density="compact"
                variant="outlined"
              />
            </VCol>

            <!-- New Event Button -->
            <VCol
              v-if="isAdmin"
              cols="auto"
              class="ml-auto"
            >
              <VBtn
                color="primary"
                @click="openCreateModal"
              >
                <VIcon left>mdi-plus</VIcon>
                New Event
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Calendar Grid -->
      <div
        v-if="selectedCalendarIds.length > 0"
        class="calendar-grid"
        :style="{
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: `${paddingPx}px`,
        }"
      >
        <VCard
          v-for="calendar in selectedCalendars"
          :key="calendar.id"
          class="calendar-card"
        >
          <VCardTitle class="d-flex align-center pa-3">
            <VIcon
              :color="getCalendarColor(calendar.category)"
              class="mr-2"
            >
              mdi-calendar
            </VIcon>
            <span>{{ calendar.name }}</span>
            <VSpacer />
            <VChip
              :color="getCalendarColor(calendar.category)"
              size="small"
              variant="tonal"
            >
              {{ calendar.category || "default" }}
            </VChip>
          </VCardTitle>

          <VCardText class="pa-0">
            <CalendarView
              :ref="(el: any) => setCalendarRef(calendar.id, el)"
              :events="getCalendarEvents(calendar.id)"
              :height="600"
              @event-click="handleEventClick"
              @event-drop="isLoggedIn ? handleEventDrop : () => {}"
              @event-resize="isLoggedIn ? handleEventResize : () => {}"
              @date-select="
                isLoggedIn
                  ? (start: Date, end: Date, allDay: boolean) => handleDateSelect(start, end, allDay, calendar.id)
                  : () => {}
              "
            />
          </VCardText>
        </VCard>
      </div>

      <!-- Empty State -->
      <VCard
        v-else
        class="text-center pa-8"
      >
        <VCardText>
          <VIcon
            size="64"
            color="grey-lighten-1"
            class="mb-4"
          >
            mdi-calendar-outline
          </VIcon>
          <h3 class="text-h6 mb-2">No Calendars Selected</h3>
          <p class="text-body-2 text-medium-emphasis">
            Please select at least one calendar from the toolbar above to view events.
          </p>
        </VCardText>
      </VCard>
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
import type { EventModalMode } from "~/types";

// Page metadata
definePageMeta({
  title: "Calendar",
  requiresAuth: false,
});

// Auth
const { data, status } = useAuth();

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
const isLoggedIn = computed(() => status.value === "authenticated" && !!currentUser.value);

// Composables
const { getAggregatedEvents, createEvent, updateEvent, deleteEvent, formatEventForCalendar, updateEventDates } =
  useEvents();

// Reactive state
const calendarRefs = ref<Record<string, InstanceType<typeof CalendarView> | null>>({});
const showEventModal = ref(false);
const selectedEvent = ref<EventData | null>(null);
const modalMode = ref<EventModalMode>("create");
const calendarEvents = ref<CalendarEvent[]>([]);
const availableCalendars = ref<CalendarOption[]>([]);
const selectedCalendarIds = ref<string[]>([]);
const isLoading = ref(false);
const snackbarStore = useSnackbarStore();

// Toolbar state
const columnCount = ref(2);
const paddingPx = ref(16);

// Column options
const columnOptions = [
  { title: "1 Column", value: 1 },
  { title: "2 Columns", value: 2 },
  { title: "3 Columns", value: 3 },
  { title: "4 Columns", value: 4 },
];

// Default values for new events
const defaultCalendarId = ref("");
const defaultStartTime = ref(new Date());
const defaultEndTime = ref(new Date(Date.now() + 60 * 60 * 1000));
const defaultAllDay = ref(false);

// Computed properties
const allCalendarsSelected = computed(() => {
  return selectedCalendarIds.value.length === availableCalendars.value.length && availableCalendars.value.length > 0;
});

const someCalendarsSelected = computed(() => {
  return selectedCalendarIds.value.length > 0;
});

const selectedCalendars = computed(() => {
  return availableCalendars.value.filter(cal => selectedCalendarIds.value.includes(cal.id));
});

const editableCalendars = computed(() => {
  // Show calendars the user can edit
  return availableCalendars.value.filter(cal => isAdmin.value || selectedCalendarIds.value.includes(cal.id));
});

// Calendar color mapping
const getCalendarColor = (category?: string): string => {
  const colorMap: Record<string, string> = {
    work: "blue",
    personal: "green",
    meetings: "orange",
    holidays: "red",
    projects: "purple",
    default: "primary",
  };
  return colorMap[category || "default"] || colorMap.default;
};

// Get events for a specific calendar
const getCalendarEvents = (calendarId: string): CalendarEvent[] => {
  return calendarEvents.value
    .filter(event => event.extendedProps?.calendarId === calendarId)
    .map(event => ({
      ...event,
      backgroundColor: getCalendarColor(availableCalendars.value.find(cal => cal.id === calendarId)?.category),
      borderColor: getCalendarColor(availableCalendars.value.find(cal => cal.id === calendarId)?.category),
    }));
};

// Set calendar ref
const setCalendarRef = (calendarId: string, el: InstanceType<typeof CalendarView> | null) => {
  if (el) {
    calendarRefs.value[calendarId] = el;
  } else {
    // Use destructuring to remove the property safely
    const { [calendarId]: removed, ...refs } = calendarRefs.value;
    calendarRefs.value = refs;
  }
};

// Load events on mount
onMounted(async () => {
  await loadCalendars();
  await checkViewParameter();
  await loadEvents();
});

// Watch for authentication status changes
watch(isLoggedIn, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await loadCalendars();
    await loadEvents();
  }
});

// Check for view parameter and load view configuration
const checkViewParameter = async () => {
  const route = useRoute();
  const viewAlias = route.query.view as string;

  console.log("Checking view parameter:", viewAlias);

  if (viewAlias) {
    try {
      console.log("Fetching view config for alias:", viewAlias);
      const response = await $fetch<{
        view: {
          id: string;
          name: string;
          alias: string;
          selectedCalendarIds: string[];
          selectedCalendars: Array<{
            id: string;
            name: string;
            category?: string;
          }>;
          columnCount: number;
          paddingPx: number;
        };
      }>(`/api/views/alias/${viewAlias}`);

      const view = response.view;
      console.log("Loaded view config:", view);

      // Apply view configuration
      selectedCalendarIds.value = view.selectedCalendarIds;
      columnCount.value = view.columnCount;
      paddingPx.value = view.paddingPx;

      console.log("Applied view config - selectedCalendarIds:", selectedCalendarIds.value);

      // Update page title to include view name
      useHead({
        title: `${view.name} - Calendar`,
      });

      snackbarStore.success("Success", `Loaded view: ${view.name}`);
    } catch (error) {
      console.error("Failed to load view:", error);
      snackbarStore.error("Error", "Failed to load view configuration");
    }
  }
};

// Load events from API
const loadEvents = async () => {
  try {
    isLoading.value = true;

    if (isLoggedIn.value) {
      const events = await getAggregatedEvents();
      calendarEvents.value = events.map(formatEventForCalendar);
    } else {
      // For non-authenticated users, load public events
      const response = await $fetch<{
        events: Array<{
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
          } | null;
          createdAt: string;
          updatedAt: string;
        }>;
        total: number;
      }>("/api/public/events");

      calendarEvents.value = response.events
        .filter(event => event.createdBy !== null) // Filter out events with null createdBy
        .map(event =>
          formatEventForCalendar({
            ...event,
            createdBy: event.createdBy!, // We've filtered out nulls above
          }),
        );
    }
  } catch (error) {
    console.error("Failed to load events:", error);
    // For non-authenticated users, show a gentler message or just empty state
    if (isLoggedIn.value) {
      snackbarStore.error("Error", "Failed to load events");
    }
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

    // For non-authenticated users, try to load public calendars
    const endpoint = isLoggedIn.value ? "/api/calendars" : "/api/public/calendars";
    const response = await $fetch<{ calendars: CalendarApiResponse[] }>(endpoint);
    availableCalendars.value = response.calendars.map(cal => ({
      id: cal.id,
      name: cal.name,
      category: cal.category || "default",
    }));

    // Initialize with all calendars selected only if no view parameter
    const route = useRoute();
    if (!route.query.view) {
      selectedCalendarIds.value = availableCalendars.value.map(cal => cal.id);
    }

    if (availableCalendars.value.length > 0) {
      defaultCalendarId.value = availableCalendars.value[0].id;
    }
  } catch (error) {
    console.error("Failed to load calendars:", error);
    // For non-authenticated users, show a gentler message or just empty state
    if (isLoggedIn.value) {
      snackbarStore.error("Error", "Failed to load calendars");
    }
  }
};

// Calendar selection methods
const toggleAllCalendars = () => {
  if (allCalendarsSelected.value) {
    selectedCalendarIds.value = [];
  } else {
    selectedCalendarIds.value = availableCalendars.value.map(cal => cal.id);
  }
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
  modalMode.value = isLoggedIn.value ? "edit" : "read";
  showEventModal.value = true;
};

const handleDateSelect = (start: Date, end: Date, allDay: boolean, calendarId?: string) => {
  if (!isLoggedIn.value) return;

  defaultStartTime.value = start;
  defaultEndTime.value = end;
  defaultAllDay.value = allDay;
  if (calendarId) {
    defaultCalendarId.value = calendarId;
  }
  openCreateModal();
};

const handleEventDrop = async (eventId: string, newStart: Date, newEnd: Date) => {
  if (!isLoggedIn.value) return;

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
  if (!isLoggedIn.value) return;
  await handleEventDrop(eventId, newStart, newEnd);
};

const handleEventSubmit = async (eventData: EventData) => {
  if (!isLoggedIn.value || modalMode.value === "read") return;

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
  if (!isLoggedIn.value || modalMode.value === "read") return;

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
.calendar-card {
  min-height: 650px;
}

.calendar-grid {
  width: 100%;
}

@media (max-width: 960px) {
  .calendar-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
