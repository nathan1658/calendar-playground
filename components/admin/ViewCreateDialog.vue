<template>
  <BaseDialog
    v-model="isOpen"
    title="Create New View"
    subtitle="Configure a new calendar view layout"
    icon="mdi-view-dashboard-plus"
    icon-color="primary"
    max-width="700"
    persistent
    :loading="loading"
    :actions="dialogActions"
  >
    <VForm
      ref="formRef"
      v-model="valid"
      class="view-form"
      @submit.prevent="handleSubmit"
    >
      <!-- View Name Field -->
      <div class="form-section">
        <VTextField
          v-model="form.name"
          :rules="nameRules"
          label="View Name"
          placeholder="Enter a descriptive name for your view"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          required
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-view-dashboard"
              size="18"
              color="primary"
            />
          </template>
        </VTextField>
      </div>

      <!-- Alias Field -->
      <div class="form-section">
        <VTextField
          v-model="form.alias"
          :rules="aliasRules"
          label="URL Alias"
          placeholder="e.g., team-view, all-calendars"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          required
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-link"
              size="18"
              color="primary"
            />
          </template>
          <template #append-inner>
            <VTooltip location="top">
              <template #activator="{ props }">
                <VIcon
                  v-bind="props"
                  icon="mdi-information"
                  size="16"
                  color="grey"
                />
              </template>
              <span>Used in URLs like /?view=your-alias</span>
            </VTooltip>
          </template>
        </VTextField>
      </div>

      <!-- Calendar Selection Field -->
      <div class="form-section">
        <VSelect
          v-model="form.selectedCalendarIds"
          :items="availableCalendars"
          item-title="name"
          item-value="id"
          label="Select Calendars"
          placeholder="Choose calendars to include in this view"
          variant="outlined"
          density="comfortable"
          multiple
          chips
          closable-chips
          hide-details="auto"
          required
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-calendar-multiple"
              size="18"
              color="primary"
            />
          </template>
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
      </div>

      <!-- Layout Configuration -->
      <VRow>
        <!-- Column Count -->
        <VCol cols="6">
          <div class="form-section">
            <VSelect
              v-model="form.columnCount"
              :items="columnOptions"
              label="Column Count"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              required
              class="enhanced-field"
            >
              <template #prepend-inner>
                <VIcon
                  icon="mdi-view-grid"
                  size="18"
                  color="primary"
                />
              </template>
            </VSelect>
          </div>
        </VCol>

        <!-- Padding -->
        <VCol cols="6">
          <div class="form-section">
            <VTextField
              v-model.number="form.paddingPx"
              :rules="paddingRules"
              label="Padding (px)"
              type="number"
              min="0"
              max="50"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              required
              class="enhanced-field"
            >
              <template #prepend-inner>
                <VIcon
                  icon="mdi-border-all-variant"
                  size="18"
                  color="primary"
                />
              </template>
            </VTextField>
          </div>
        </VCol>
      </VRow>

      <!-- Preview Section -->
      <div class="form-section">
        <VCard
          variant="outlined"
          class="preview-card"
        >
          <VCardTitle class="text-body-1 font-weight-medium">
            <VIcon
              icon="mdi-eye"
              size="16"
              class="mr-2"
            />
            Preview Layout
          </VCardTitle>
          <VCardText>
            <div
              class="preview-grid"
              :style="{
                display: 'grid',
                gridTemplateColumns: `repeat(${form.columnCount}, 1fr)`,
                gap: `${form.paddingPx}px`,
                minHeight: '120px',
              }"
            >
              <div
                v-for="i in Math.min(form.columnCount, form.selectedCalendarIds.length)"
                :key="i"
                class="preview-calendar"
              >
                <div class="preview-calendar-header">
                  <VIcon
                    icon="mdi-calendar"
                    size="14"
                    class="mr-1"
                  />
                  Calendar {{ i }}
                </div>
                <div class="preview-calendar-content">
                  Calendar content area
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </div>
    </VForm>
  </BaseDialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "created"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const availableCalendars = ref<Array<{ id: string; name: string; category?: string }>>([]);

const snackbarStore = useSnackbarStore();

const form = ref({
  name: "",
  alias: "",
  selectedCalendarIds: [] as string[],
  columnCount: 2,
  paddingPx: 16,
});

const columnOptions = [
  { title: "1 Column", value: 1 },
  { title: "2 Columns", value: 2 },
  { title: "3 Columns", value: 3 },
  { title: "4 Columns", value: 4 },
];

// Validation rules
const nameRules = [
  (v: string) => !!v || "View name is required",
  (v: string) => (v && v.length <= 100) || "Name must be less than 100 characters",
];

const aliasRules = [
  (v: string) => !!v || "Alias is required",
  (v: string) => /^[a-zA-Z0-9_-]+$/.test(v) || "Alias can only contain letters, numbers, hyphens, and underscores",
  (v: string) => (v && v.length <= 50) || "Alias must be less than 50 characters",
];

const paddingRules = [
  (v: number) => v >= 0 || "Padding must be non-negative",
  (v: number) => v <= 50 || "Padding must be 50px or less",
];

// Calendar selection helpers
const allCalendarsSelected = computed(() => {
  return form.value.selectedCalendarIds.length === availableCalendars.value.length && availableCalendars.value.length > 0;
});

const someCalendarsSelected = computed(() => {
  return form.value.selectedCalendarIds.length > 0;
});

const toggleAllCalendars = () => {
  if (allCalendarsSelected.value) {
    form.value.selectedCalendarIds = [];
  } else {
    form.value.selectedCalendarIds = availableCalendars.value.map(cal => cal.id);
  }
};

// Dialog actions
const dialogActions = computed(() => [
  {
    label: "Cancel",
    variant: "text",
    color: "grey",
    disabled: loading.value,
    onClick: () => {
      isOpen.value = false;
    },
  },
  {
    label: "Create View",
    variant: "flat",
    color: "primary",
    loading: loading.value,
    disabled: !valid.value,
    onClick: handleSubmit,
  },
]);

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  const { valid: formValid } = await formRef.value.validate();
  if (!formValid) return;

  loading.value = true;
  try {
    await $fetch("/api/views", {
      method: "POST",
      body: form.value,
    });

    snackbarStore.success("Success", "View created successfully");
    emit("created");
    isOpen.value = false;
    resetForm();
  } catch (error: unknown) {
    console.error("Failed to create view:", error);
    const message = (error as { data?: { message?: string } }).data?.message || "Failed to create view";
    snackbarStore.error("Error", message);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    name: "",
    alias: "",
    selectedCalendarIds: [],
    columnCount: 2,
    paddingPx: 16,
  };
  formRef.value?.resetValidation();
};

const loadCalendars = async () => {
  try {
    const response = await $fetch<{ calendars: Array<{ id: string; name: string; category?: string }> }>("/api/calendars");
    availableCalendars.value = response.calendars;
  } catch (error) {
    console.error("Failed to load calendars:", error);
    snackbarStore.error("Error", "Failed to load calendars");
  }
};

watch(isOpen, (newValue) => {
  if (newValue) {
    loadCalendars();
    resetForm();
  }
});
</script>

<style scoped>
.form-section {
  margin-bottom: 1.5rem;
}

.enhanced-field {
  background: rgba(var(--v-theme-surface-variant), 0.1);
}

.preview-card {
  margin-top: 1rem;
}

.preview-grid {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.preview-calendar {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 6px;
  padding: 0.75rem;
}

.preview-calendar-header {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.preview-calendar-content {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-align: center;
  padding: 1rem 0;
  border: 1px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}
</style>