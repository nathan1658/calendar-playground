<template>
  <VDialog
    v-model="isOpen"
    max-width="600px"
    persistent
  >
    <VCard>
      <VCardTitle>
        <span class="text-h5">{{ isEditMode ? "Edit Event" : "Create New Event" }}</span>
      </VCardTitle>

      <VCardText>
        <VForm
          ref="formRef"
          v-model="isFormValid"
          @submit.prevent="handleSubmit"
        >
          <VContainer>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="formData.subject"
                  label="Event Title"
                  :rules="subjectRules"
                  required
                  variant="outlined"
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="formData.description"
                  label="Description"
                  :rules="descriptionRules"
                  variant="outlined"
                  rows="3"
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="formData.calendarId"
                  :items="calendarOptions"
                  item-title="name"
                  item-value="id"
                  label="Calendar"
                  :rules="calendarRules"
                  required
                  variant="outlined"
                />
              </VCol>

              <VCol cols="12">
                <VCheckbox
                  v-model="formData.allDay"
                  label="All Day Event"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.startDate"
                  label="Start Date"
                  type="date"
                  :rules="startDateRules"
                  required
                  variant="outlined"
                />
              </VCol>

              <VCol
                v-if="!formData.allDay"
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.startTime"
                  label="Start Time"
                  type="time"
                  :rules="startTimeRules"
                  required
                  variant="outlined"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.endDate"
                  label="End Date"
                  type="date"
                  :rules="endDateRules"
                  required
                  variant="outlined"
                />
              </VCol>

              <VCol
                v-if="!formData.allDay"
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.endTime"
                  label="End Time"
                  type="time"
                  :rules="endTimeRules"
                  required
                  variant="outlined"
                />
              </VCol>
            </VRow>
          </VContainer>
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          color="grey-darken-1"
          variant="text"
          @click="handleCancel"
        >
          Cancel
        </VBtn>
        <VBtn
          v-if="isEditMode"
          color="error"
          variant="text"
          :loading="isDeleting"
          @click="handleDelete"
        >
          Delete
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :loading="isSubmitting"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          {{ isEditMode ? "Update" : "Create" }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
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
  modelValue: boolean;
  event?: EventData | null;
  calendars: CalendarOption[];
  mode?: "create" | "edit";
  defaultCalendarId?: string;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
  defaultAllDay?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
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

const formRef = ref();
const isFormValid = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const isEditMode = computed(() => props.mode === "edit" || !!props.event?.id);

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

// Watch for modal opening to initialize form
watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      initializeForm();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.v-card {
  overflow: visible;
}
</style>
