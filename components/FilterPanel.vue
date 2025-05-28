<template>
  <VCard>
    <VCardTitle>
      <VRow align="center">
        <VCol>
          <VIcon
            icon="mdi-filter"
            class="mr-2"
          />
          Filters
        </VCol>
        <VCol cols="auto">
          <VBtn
            v-if="hasActiveFilters"
            variant="text"
            size="small"
            color="primary"
            @click="clearAllFilters"
          >
            Clear All
          </VBtn>
        </VCol>
      </VRow>
    </VCardTitle>

    <VCardText>
      <VForm @submit.prevent="applyFilters">
        <!-- Date Range Filter -->
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="localFilters.startDate"
              label="Start Date"
              type="date"
              variant="outlined"
              density="compact"
              @change="onFilterChange"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="localFilters.endDate"
              label="End Date"
              type="date"
              variant="outlined"
              density="compact"
              @change="onFilterChange"
            />
          </VCol>
        </VRow>

        <!-- Quick Date Range Buttons -->
        <VRow class="mb-3">
          <VCol cols="12">
            <VChipGroup
              v-model="selectedQuickRange"
              class="text-center"
              @update:model-value="applyQuickDateRange"
            >
              <VChip
                value="today"
                variant="outlined"
                size="small"
              >
                Today
              </VChip>
              <VChip
                value="week"
                variant="outlined"
                size="small"
              >
                This Week
              </VChip>
              <VChip
                value="month"
                variant="outlined"
                size="small"
              >
                This Month
              </VChip>
              <VChip
                value="quarter"
                variant="outlined"
                size="small"
              >
                This Quarter
              </VChip>
            </VChipGroup>
          </VCol>
        </VRow>

        <!-- Text Search -->
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="localFilters.search"
              label="Search events..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              @input="onSearchInput"
            />
          </VCol>
        </VRow>

        <!-- Calendar Selection -->
        <VRow>
          <VCol cols="12">
            <VSelect
              v-model="localFilters.selectedCalendarIds"
              :items="calendarOptions"
              item-title="name"
              item-value="id"
              label="Calendars"
              multiple
              variant="outlined"
              density="compact"
              chips
              closable-chips
              @update:model-value="onFilterChange"
            >
              <template #prepend-item>
                <VListItem @click="toggleAllCalendars">
                  <template #prepend>
                    <VCheckbox
                      :model-value="allCalendarsSelected"
                      :indeterminate="someCalendarsSelected && !allCalendarsSelected"
                      @update:model-value="toggleAllCalendars"
                    />
                  </template>
                  <VListItemTitle>
                    {{ allCalendarsSelected ? "Deselect All" : "Select All" }}
                  </VListItemTitle>
                </VListItem>
                <VDivider />
              </template>
              <template #selection="{ item, index }">
                <VChip
                  v-if="index < 2"
                  :key="item.raw.id"
                  size="small"
                  closable
                  @click:close="removeCalendar(item.raw.id)"
                >
                  {{ item.raw.name }}
                </VChip>
                <span
                  v-if="index === 2"
                  class="text-grey text-caption align-self-center"
                >
                  (+{{ localFilters.selectedCalendarIds.length - 2 }} others)
                </span>
              </template>
            </VSelect>
          </VCol>
        </VRow>

        <!-- Category Filter -->
        <VRow>
          <VCol cols="12">
            <VSelect
              v-model="localFilters.category"
              :items="categoryOptions"
              label="Category"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="onFilterChange"
            />
          </VCol>
        </VRow>

        <!-- Filter Summary -->
        <VRow v-if="hasActiveFilters">
          <VCol cols="12">
            <VAlert
              type="info"
              variant="tonal"
              density="compact"
            >
              <template #prepend>
                <VIcon icon="mdi-filter-check" />
              </template>
              <div class="text-caption">
                {{ filterSummary }}
              </div>
            </VAlert>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  search?: string;
  selectedCalendarIds: string[];
  category?: string;
}

export interface CalendarOption {
  id: string;
  name: string;
  category?: string;
}

interface Props {
  calendars: CalendarOption[];
  modelValue: FilterOptions;
  loading?: boolean;
}

interface Emits {
  (e: "update:modelValue" | "apply", filters: FilterOptions): void;
  (e: "clear"): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// Local state for filters
const localFilters = ref<FilterOptions>({
  startDate: "",
  endDate: "",
  search: "",
  selectedCalendarIds: [],
  category: "",
});

const selectedQuickRange = ref<string | null>(null);

// Debounced search
let searchTimeout: NodeJS.Timeout;

// Initialize local filters from props
watch(
  () => props.modelValue,
  newValue => {
    localFilters.value = { ...newValue };
  },
  { immediate: true },
);

// Calendar options with select all functionality
const calendarOptions = computed(() => props.calendars);

const allCalendarsSelected = computed(() => {
  return localFilters.value.selectedCalendarIds.length === props.calendars.length;
});

const someCalendarsSelected = computed(() => {
  return localFilters.value.selectedCalendarIds.length > 0;
});

// Category options derived from calendars
const categoryOptions = computed(() => {
  const categories = props.calendars
    .map(cal => cal.category)
    .filter((cat): cat is string => Boolean(cat))
    .filter((cat, index, self) => self.indexOf(cat) === index)
    .sort();

  return categories.map(cat => ({
    title: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: cat,
  }));
});

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    Boolean(localFilters.value.startDate) ||
    Boolean(localFilters.value.endDate) ||
    Boolean(localFilters.value.search) ||
    localFilters.value.selectedCalendarIds.length < props.calendars.length ||
    Boolean(localFilters.value.category)
  );
});

// Generate filter summary
const filterSummary = computed(() => {
  const parts: string[] = [];

  if (localFilters.value.startDate || localFilters.value.endDate) {
    if (localFilters.value.startDate && localFilters.value.endDate) {
      parts.push(`Date: ${localFilters.value.startDate} to ${localFilters.value.endDate}`);
    } else if (localFilters.value.startDate) {
      parts.push(`From: ${localFilters.value.startDate}`);
    } else if (localFilters.value.endDate) {
      parts.push(`Until: ${localFilters.value.endDate}`);
    }
  }

  if (localFilters.value.search) {
    parts.push(`Search: "${localFilters.value.search}"`);
  }

  if (localFilters.value.selectedCalendarIds.length < props.calendars.length) {
    parts.push(`Calendars: ${localFilters.value.selectedCalendarIds.length} selected`);
  }

  if (localFilters.value.category) {
    parts.push(`Category: ${localFilters.value.category}`);
  }

  return parts.join(" • ");
});

// Filter change handlers
const onFilterChange = () => {
  selectedQuickRange.value = null; // Clear quick range when manually changing dates
  applyFilters();
};

const onSearchInput = () => {
  // Debounce search input
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const applyFilters = () => {
  emit("update:modelValue", { ...localFilters.value });
  emit("apply", { ...localFilters.value });
};

// Calendar selection helpers
const toggleAllCalendars = () => {
  if (allCalendarsSelected.value) {
    localFilters.value.selectedCalendarIds = [];
  } else {
    localFilters.value.selectedCalendarIds = props.calendars.map(cal => cal.id);
  }
  onFilterChange();
};

const removeCalendar = (calendarId: string) => {
  const index = localFilters.value.selectedCalendarIds.indexOf(calendarId);
  if (index > -1) {
    localFilters.value.selectedCalendarIds.splice(index, 1);
    onFilterChange();
  }
};

// Quick date range functionality
const applyQuickDateRange = (value: string | null) => {
  if (!value) return;

  const today = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (value) {
    case "today":
      startDate = new Date(today);
      endDate = new Date(today);
      break;
    case "week":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
      break;
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case "quarter": {
      const quarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), quarter * 3, 1);
      endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
      break;
    }
    default:
      return;
  }

  localFilters.value.startDate = startDate.toISOString().split("T")[0];
  localFilters.value.endDate = endDate.toISOString().split("T")[0];
  applyFilters();
};

// Clear all filters
const clearAllFilters = () => {
  localFilters.value = {
    startDate: "",
    endDate: "",
    search: "",
    selectedCalendarIds: props.calendars.map(cal => cal.id),
    category: "",
  };
  selectedQuickRange.value = null;
  emit("clear");
  applyFilters();
};

// Initialize with all calendars selected
onMounted(() => {
  if (localFilters.value.selectedCalendarIds.length === 0) {
    localFilters.value.selectedCalendarIds = props.calendars.map(cal => cal.id);
  }
});
</script>

<style scoped>
.v-chip-group {
  justify-content: center;
}
</style>
