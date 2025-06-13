<template>
  <BaseDialog
    v-model="isOpen"
    :title="getDialogTitle()"
    :subtitle="getDialogSubtitle()"
    :icon="getDialogIcon()"
    icon-color="primary"
    max-width="700"
    persistent
    :loading="isSubmitting || isDeleting"
    :actions="dialogActions"
  >
    <!-- Read Mode View -->
    <div
      v-if="isReadMode"
      class="event-view"
    >
      <!-- Event Header -->
      <div class="event-header">
        <div class="event-title-section">
          <h2 class="event-title">{{ formData.subject }}</h2>
          <VChip
            v-if="selectedCalendarName"
            :color="getCalendarColor()"
            size="small"
            variant="tonal"
            class="mt-2"
          >
            <VIcon
              icon="mdi-calendar"
              size="14"
              class="mr-1"
            />
            {{ selectedCalendarName }}
          </VChip>
        </div>
      </div>

      <!-- Event Details Cards -->
      <div class="event-details">
        <!-- Time & Duration Card -->
        <VCard
          class="detail-card mb-4"
          variant="outlined"
        >
          <VCardText class="pa-4">
            <div class="d-flex align-center mb-3">
              <VIcon
                icon="mdi-clock-outline"
                color="primary"
                size="20"
                class="mr-2"
              />
              <span class="text-subtitle-1 font-weight-medium">When</span>
            </div>

            <div class="time-details">
              <div class="d-flex align-center mb-2">
                <VIcon
                  :icon="formData.allDay ? 'mdi-weather-sunny' : 'mdi-clock-start'"
                  :color="formData.allDay ? 'warning' : 'success'"
                  size="16"
                  class="mr-2"
                />
                <span class="text-body-1">
                  <strong>{{ formatDate(formData.startDate) }}</strong>
                  <span
                    v-if="!formData.allDay"
                    class="ml-2"
                  >
                    at {{ formatTime(formData.startTime) }}
                  </span>
                </span>
              </div>

              <div class="d-flex align-center mb-2">
                <VIcon
                  :icon="formData.allDay ? 'mdi-weather-sunset' : 'mdi-clock-end'"
                  :color="formData.allDay ? 'warning' : 'error'"
                  size="16"
                  class="mr-2"
                />
                <span class="text-body-1">
                  <strong>{{ formatDate(formData.endDate) }}</strong>
                  <span
                    v-if="!formData.allDay"
                    class="ml-2"
                  >
                    at {{ formatTime(formData.endTime) }}
                  </span>
                </span>
              </div>

              <div
                v-if="formData.allDay"
                class="all-day-indicator"
              >
                <VIcon
                  icon="mdi-calendar-clock"
                  color="info"
                  size="16"
                  class="mr-2"
                />
                <span class="text-body-2 text-info">All day event</span>
              </div>

              <div
                v-if="eventDuration"
                class="duration-indicator mt-2"
              >
                <VIcon
                  icon="mdi-timer-outline"
                  color="info"
                  size="16"
                  class="mr-2"
                />
                <span class="text-body-2 text-info">Duration: {{ eventDuration }}</span>
              </div>
            </div>
          </VCardText>
        </VCard>

        <!-- Description Card -->
        <VCard
          v-if="formData.description"
          class="detail-card mb-4"
          variant="outlined"
        >
          <VCardText class="pa-4">
            <div class="d-flex align-center mb-3">
              <VIcon
                icon="mdi-text-box-outline"
                color="primary"
                size="20"
                class="mr-2"
              />
              <span class="text-subtitle-1 font-weight-medium">Description</span>
            </div>
            <div class="description-content">
              <p class="text-body-1 mb-0">{{ formData.description }}</p>
            </div>
          </VCardText>
        </VCard>

        <!-- Additional Info Card -->
        <VCard
          class="detail-card"
          variant="outlined"
        >
          <VCardText class="pa-4">
            <div class="d-flex align-center mb-3">
              <VIcon
                icon="mdi-information-outline"
                color="primary"
                size="20"
                class="mr-2"
              />
              <span class="text-subtitle-1 font-weight-medium">Event Information</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Event Type:</span>
                <span class="info-value">{{ formData.allDay ? "All Day" : "Timed Event" }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Calendar:</span>
                <span class="info-value">{{ selectedCalendarName || "Unknown" }}</span>
              </div>
            </div>
          </VCardText>
        </VCard>
      </div>
    </div>

    <!-- Form Mode (Create/Edit) -->
    <VForm
      v-else
      ref="formRef"
      v-model="isFormValid"
      class="event-form"
      @submit.prevent="handleSubmit"
    >
      <!-- Event Title -->
      <div class="form-section">
        <VTextField
          v-model="formData.subject"
          label="Event Title"
          placeholder="Enter a descriptive title for your event"
          :rules="subjectRules"
          :readonly="isReadMode"
          required
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-format-title"
              size="18"
              color="primary"
            />
          </template>
        </VTextField>
      </div>

      <!-- Description -->
      <div class="form-section">
        <VTextarea
          v-model="formData.description"
          label="Description (Optional)"
          placeholder="Add additional details about this event..."
          :rules="descriptionRules"
          :readonly="isReadMode"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          rows="3"
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-text"
              size="18"
              color="primary"
            />
          </template>
        </VTextarea>
      </div>

      <!-- Calendar Selection -->
      <div class="form-section">
        <VSelect
          v-model="formData.calendarId"
          :items="calendarOptions"
          item-title="name"
          item-value="id"
          label="Calendar"
          placeholder="Select which calendar to add this event to"
          :rules="calendarRules"
          :readonly="isReadMode"
          required
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-calendar"
              size="18"
              color="primary"
            />
          </template>
          <template #item="{ props, item }">
            <VListItem
              v-bind="props"
              class="calendar-list-item"
            >
              <template #prepend>
                <VAvatar
                  size="32"
                  color="primary"
                  variant="tonal"
                  class="mr-3"
                >
                  <VIcon
                    icon="mdi-calendar"
                    size="16"
                  />
                </VAvatar>
              </template>
              <VListItemTitle class="font-weight-medium">
                {{ item.raw.name }}
              </VListItemTitle>
              <VListItemSubtitle
                v-if="item.raw.category"
                class="text-caption"
              >
                {{ item.raw.category }}
              </VListItemSubtitle>
            </VListItem>
          </template>
        </VSelect>
      </div>

      <!-- All Day Toggle -->
      <div class="form-section">
        <div class="all-day-card">
          <div class="d-flex align-center">
            <VCheckbox
              v-model="formData.allDay"
              color="primary"
              :readonly="isReadMode"
              hide-details
              density="compact"
              class="all-day-checkbox"
            />
            <div class="flex-grow-1 ml-2">
              <div
                class="all-day-title"
                :class="{ 'read-only': isReadMode }"
                @click="!isReadMode && (formData.allDay = !formData.allDay)"
              >
                All Day Event
              </div>
              <p class="all-day-description">This event lasts the entire day without specific start and end times</p>
            </div>
            <VIcon
              :icon="formData.allDay ? 'mdi-weather-sunny' : 'mdi-clock-outline'"
              size="20"
              :color="formData.allDay ? 'warning' : 'grey'"
              class="ml-2"
            />
          </div>
        </div>
      </div>

      <!-- Date and Time Fields -->
      <div class="form-section">
        <div class="datetime-grid">
          <!-- Start Date -->
          <div class="datetime-field">
            <VTextField
              v-model="formData.startDate"
              label="Start Date"
              type="date"
              :rules="startDateRules"
              :readonly="isReadMode"
              required
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="enhanced-field"
            >
              <template #prepend-inner>
                <VIcon
                  icon="mdi-calendar-start"
                  size="18"
                  color="success"
                />
              </template>
            </VTextField>
          </div>

          <!-- Start Time -->
          <div
            v-if="!formData.allDay"
            class="datetime-field"
          >
            <VTextField
              v-model="formData.startTime"
              label="Start Time"
              type="time"
              :rules="startTimeRules"
              :readonly="isReadMode"
              required
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="enhanced-field"
            >
              <template #prepend-inner>
                <VIcon
                  icon="mdi-clock-start"
                  size="18"
                  color="success"
                />
              </template>
            </VTextField>
          </div>

          <!-- End Date -->
          <div class="datetime-field">
            <VTextField
              v-model="formData.endDate"
              label="End Date"
              type="date"
              :rules="endDateRules"
              :readonly="isReadMode"
              required
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="enhanced-field"
            >
              <template #prepend-inner>
                <VIcon
                  icon="mdi-calendar-end"
                  size="18"
                  color="error"
                />
              </template>
            </VTextField>
          </div>

          <!-- End Time -->
          <div
            v-if="!formData.allDay"
            class="datetime-field"
          >
            <VTextField
              v-model="formData.endTime"
              label="End Time"
              type="time"
              :rules="endTimeRules"
              :readonly="isReadMode"
              required
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="enhanced-field"
            >
              <template #prepend-inner>
                <VIcon
                  icon="mdi-clock-end"
                  size="18"
                  color="error"
                />
              </template>
            </VTextField>
          </div>
        </div>
      </div>

      <!-- Duration Display -->
      <div
        v-if="eventDuration"
        class="duration-display"
      >
        <VIcon
          icon="mdi-timer-outline"
          size="16"
          color="info"
          class="mr-2"
        />
        <span class="duration-text">Duration: {{ eventDuration }}</span>
      </div>
    </VForm>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from "~/components/base/BaseDialog.vue";
import type { EventModalMode } from "~/types";

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

export interface CalendarOption {
  id: string;
  name: string;
  category?: string;
}

export interface EventData {
  id?: string;
  subject: string;
  description?: string;
  calendarId: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

interface Props {
  event?: EventData | null;
  calendars: CalendarOption[];
  mode?: EventModalMode;
  defaultCalendarId?: string;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
  defaultAllDay?: boolean;
}

interface Emits {
  (e: "submit", data: EventData): void;
  (e: "delete", eventId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  event: null,
  mode: "create",
  defaultCalendarId: "",
  defaultStartTime: () => new Date(),
  defaultEndTime: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
  defaultAllDay: false,
});

const emit = defineEmits<Emits>();

// Use defineModel for v-model binding
const isOpen = defineModel<boolean>({ default: false });

const formRef = ref();
const isFormValid = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);

const isEditMode = computed(() => props.mode === "edit" || !!props.event?.id);
const isReadMode = computed(() => props.mode === "read");

const calendarOptions = computed(() => {
  return props.calendars.map(cal => ({
    id: cal.id,
    name: cal.category ? `${cal.name} (${cal.category})` : cal.name,
  }));
});

const formData = reactive<EventFormData>({
  subject: "",
  description: "",
  calendarId: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  allDay: false,
});

// Validation rules
const subjectRules = [
  (v: string) => !!v || "Event title is required",
  (v: string) => (v && v.length <= 200) || "Event title must be less than 200 characters",
];

const descriptionRules = [(v: string) => !v || v.length <= 1000 || "Description must be less than 1000 characters"];

const calendarRules = [(v: string) => !!v || "Please select a calendar"];

const startDateRules = [(v: string) => !!v || "Start date is required"];

const startTimeRules = [(v: string) => !formData.allDay || !!v || "Start time is required"];

const endDateRules = [
  (v: string) => !!v || "End date is required",
  (v: string) => {
    if (!v || !formData.startDate) return true;
    return new Date(v) >= new Date(formData.startDate) || "End date must be after start date";
  },
];

const endTimeRules = [
  (v: string) => !formData.allDay || !!v || "End time is required",
  (v: string) => {
    if (formData.allDay || !v || !formData.startTime) return true;
    if (formData.startDate !== formData.endDate) return true;
    return v > formData.startTime || "End time must be after start time";
  },
];

// Initialize form data
const initializeForm = () => {
  if (props.event) {
    // Edit mode - populate with existing event data
    const startDate = new Date(props.event.startTime);
    const endDate = new Date(props.event.endTime);

    formData.subject = props.event.subject;
    formData.description = props.event.description || "";
    formData.calendarId = props.event.calendarId;
    formData.allDay = props.event.allDay;
    formData.startDate = startDate.toISOString().split("T")[0];
    formData.endDate = endDate.toISOString().split("T")[0];
    formData.startTime = startDate.toTimeString().slice(0, 5);
    formData.endTime = endDate.toTimeString().slice(0, 5);
  } else {
    // Create mode - use defaults
    const startDate = props.defaultStartTime;
    const endDate = props.defaultEndTime;

    formData.subject = "";
    formData.description = "";
    formData.calendarId = props.defaultCalendarId;
    formData.allDay = props.defaultAllDay;
    formData.startDate = startDate.toISOString().split("T")[0];
    formData.endDate = endDate.toISOString().split("T")[0];
    formData.startTime = startDate.toTimeString().slice(0, 5);
    formData.endTime = endDate.toTimeString().slice(0, 5);
  }
};

// Handle form submission
const handleSubmit = async () => {
  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isSubmitting.value = true;

  try {
    // Combine date and time
    let startDateTime: Date;
    let endDateTime: Date;

    if (formData.allDay) {
      startDateTime = new Date(formData.startDate + "T00:00:00");
      endDateTime = new Date(formData.endDate + "T23:59:59");
    } else {
      startDateTime = new Date(formData.startDate + "T" + formData.startTime);
      endDateTime = new Date(formData.endDate + "T" + formData.endTime);
    }

    const eventData: EventData = {
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      calendarId: formData.calendarId,
      startTime: startDateTime,
      endTime: endDateTime,
      allDay: formData.allDay,
    };

    if (isEditMode.value && props.event?.id) {
      eventData.id = props.event.id;
    }

    emit("submit", eventData);
  } catch (error) {
    console.error("Error submitting event:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Handle delete
const handleDelete = async () => {
  if (!props.event?.id) return;

  isDeleting.value = true;
  try {
    emit("delete", props.event.id);
  } finally {
    isDeleting.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  formRef.value?.reset();
  isOpen.value = false;
};

// Dialog actions
const dialogActions = computed(() => {
  if (isReadMode.value) {
    return [
      {
        text: "Close",
        variant: "elevated" as const,
        color: "primary",
        onClick: handleCancel,
      },
    ];
  }

  const actions = [
    {
      text: "Cancel",
      variant: "text" as const,
      color: "grey",
      disabled: isSubmitting.value || isDeleting.value,
      onClick: handleCancel,
    },
  ];

  if (isEditMode.value) {
    actions.push({
      text: "Delete",
      variant: "text" as const,
      color: "error",
      loading: isDeleting.value,
      disabled: isSubmitting.value,
      onClick: handleDelete,
    });
  }

  actions.push({
    text: isEditMode.value ? "Update Event" : "Create Event",
    variant: "elevated" as const,
    color: "primary",
    loading: isSubmitting.value,
    disabled: !isFormValid.value || isDeleting.value,
    onClick: handleSubmit,
  });

  return actions;
});

// Event duration calculation
const eventDuration = computed(() => {
  if (!formData.startDate || !formData.endDate) return null;

  let start: Date;
  let end: Date;

  if (formData.allDay) {
    start = new Date(formData.startDate + "T00:00:00");
    end = new Date(formData.endDate + "T23:59:59");
  } else {
    if (!formData.startTime || !formData.endTime) return null;
    start = new Date(formData.startDate + "T" + formData.startTime);
    end = new Date(formData.endDate + "T" + formData.endTime);
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return null;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (formData.allDay) {
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 day" : `${days} days`;
  }

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    let result = diffDays === 1 ? "1 day" : `${diffDays} days`;
    if (remainingHours > 0) {
      result += remainingHours === 1 ? " 1 hour" : ` ${remainingHours} hours`;
    }
    return result;
  }

  if (diffHours > 0) {
    let result = diffHours === 1 ? "1 hour" : `${diffHours} hours`;
    if (diffMinutes > 0) {
      result += diffMinutes === 1 ? " 1 minute" : ` ${diffMinutes} minutes`;
    }
    return result;
  }

  return diffMinutes === 1 ? "1 minute" : `${diffMinutes} minutes`;
});

// Dialog title, subtitle, and icon based on mode
const getDialogTitle = () => {
  if (isReadMode.value) return "Event Details";
  return isEditMode.value ? "Edit Event" : "Create New Event";
};

const getDialogSubtitle = () => {
  if (isReadMode.value) return "View event information";
  return isEditMode.value ? "Update event details" : "Schedule a new event";
};

const getDialogIcon = () => {
  if (isReadMode.value) return "mdi-calendar-check";
  return isEditMode.value ? "mdi-calendar-edit" : "mdi-calendar-plus";
};

// Helper functions for read mode view
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Computed properties for read mode view
const selectedCalendarName = computed(() => {
  const calendar = props.calendars.find(cal => cal.id === formData.calendarId);
  return calendar?.name || "";
});

const getCalendarColor = (): string => {
  const calendar = props.calendars.find(cal => cal.id === formData.calendarId);
  const category = calendar?.category || "default";
  const colorMap: Record<string, string> = {
    work: "blue",
    personal: "green",
    meetings: "orange",
    holidays: "red",
    projects: "purple",
    default: "primary",
  };
  return colorMap[category] || colorMap.default;
};

// Watch for modal opening to initialize form
watch(
  isOpen,
  newValue => {
    if (newValue) {
      initializeForm();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.event-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-section {
  margin-bottom: 24px;
  animation: slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: backwards;
}

.form-section:nth-child(1) {
  animation-delay: 0.1s;
}
.form-section:nth-child(2) {
  animation-delay: 0.11s;
}
.form-section:nth-child(3) {
  animation-delay: 0.12s;
}
.form-section:nth-child(4) {
  animation-delay: 0.13s;
}
.form-section:nth-child(5) {
  animation-delay: 0.14s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.enhanced-field {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.enhanced-field:hover {
  transform: translateY(-1px);
}

:deep(.enhanced-field .v-field) {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.enhanced-field:hover .v-field) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.enhanced-field .v-field--focused) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3);
  border-color: rgb(var(--v-theme-primary));
}

:deep(.enhanced-field .v-field--readonly) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  opacity: 0.8;
}

/* All Day Card */
.all-day-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.04));
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.all-day-card:hover {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-primary), 0.06));
  border-color: rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.2);
}

.all-day-checkbox {
  margin-top: -8px;
}

.all-day-title {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: color 0.2s ease;
  margin-bottom: 4px;
}

.all-day-title:hover:not(.read-only) {
  color: rgb(var(--v-theme-primary));
}

.all-day-title.read-only {
  cursor: default;
}

.all-day-description {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.4;
  margin: 0;
}

/* Date Time Grid */
.datetime-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.datetime-field {
  min-width: 0; /* Prevents grid overflow */
}

/* Calendar List Items */
.calendar-list-item {
  border-radius: 12px;
  margin: 2px 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(4px);
}

/* Duration Display */
.duration-display {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(var(--v-theme-info), 0.12);
  border: 1px solid rgba(var(--v-theme-info), 0.3);
  border-radius: 12px;
  margin-top: 8px;
  animation: fadeIn 0.3s ease;
}

.duration-text {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-info));
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-section {
    margin-bottom: 20px;
  }

  .datetime-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .all-day-card {
    padding: 16px;
  }

  .duration-display {
    padding: 10px 14px;
  }
}

/* Focus and accessibility improvements */
:deep(.v-field__input) {
  transition: all 0.2s ease;
}

:deep(.v-checkbox .v-selection-control__wrapper) {
  transition: all 0.2s ease;
}

:deep(.v-checkbox:hover .v-selection-control__wrapper) {
  transform: scale(1.1);
}

/* Date and time field specific styling */
:deep(.v-field input[type="date"]),
:deep(.v-field input[type="time"]) {
  font-family: "Roboto", sans-serif;
  font-weight: 500;
}

/* Enhanced textarea */
:deep(.v-textarea .v-field__field) {
  align-items: flex-start;
}

:deep(.v-textarea .v-field__prepend-inner) {
  padding-top: 12px;
}

/* Loading state for form */
.event-form[data-loading="true"] {
  opacity: 0.7;
  pointer-events: none;
}

/* Smooth transitions for all interactive elements */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

/* Enhanced field icons */
:deep(.v-field__prepend-inner .v-icon) {
  transition: all 0.2s ease;
}

:deep(.v-field--focused .v-field__prepend-inner .v-icon) {
  transform: scale(1.1);
}

/* Read Mode Styles */
.event-view {
  padding: 0;
}

.event-header {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.04));
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.event-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  line-height: 1.3;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.time-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.all-day-indicator,
.duration-indicator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(var(--v-theme-info), 0.08);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-info), 0.2);
}

.description-content {
  padding: 16px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.info-label {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.875rem;
}

.info-value {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.875rem;
}

/* Animations for read mode */
.event-view {
  animation: fadeInUp 0.4s ease-out;
}

.detail-card {
  animation: slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: backwards;
}

.detail-card:nth-child(1) {
  animation-delay: 0.1s;
}

.detail-card:nth-child(2) {
  animation-delay: 0.15s;
}

.detail-card:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design for read mode */
@media (max-width: 768px) {
  .event-header {
    padding: 16px;
    margin-bottom: 20px;
  }

  .event-title {
    font-size: 1.5rem;
  }

  .detail-card {
    margin-bottom: 16px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-label {
    font-size: 0.8rem;
  }

  .info-value {
    font-size: 0.85rem;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .event-header {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.15), rgba(var(--v-theme-primary), 0.08));
  }

  .detail-card {
    background: rgba(var(--v-theme-surface-variant), 0.8);
  }

  .description-content,
  .info-item,
  .all-day-indicator,
  .duration-indicator {
    background: rgba(var(--v-theme-surface-variant), 0.5);
  }
}
</style>
