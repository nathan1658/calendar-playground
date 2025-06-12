<template>
  <VCard>
    <!-- Enhanced Header -->
    <VCardTitle class="d-flex justify-space-between align-center pa-6 bg-grey-lighten-5">
      <div class="d-flex align-center">
        <VAvatar
          color="primary"
          size="40"
          class="mr-3"
        >
          <VIcon
            icon="mdi-view-dashboard"
            color="white"
            size="20"
          />
        </VAvatar>
        <div>
          <h2 class="text-h6 font-weight-bold text-grey-darken-4">View Management</h2>
          <p class="text-body-2 text-grey-darken-1 ma-0">Manage calendar view configurations</p>
        </div>
      </div>
      <VBtn
        color="primary"
        @click="showCreateDialog = true"
      >
        <template #prepend>
          <VIcon
            icon="mdi-plus"
            size="18"
          />
        </template>
        Create View
      </VBtn>
    </VCardTitle>

    <VCardText class="pa-0">
      <VDataTable
        :headers="headers"
        :items="views"
        :loading="loading"
        item-value="id"
        hover
        :items-per-page="15"
        :items-per-page-options="[10, 15, 25, 50]"
      >
        <template #item.name="{ item }">
          <div class="py-2">
            <div class="font-weight-medium text-grey-darken-4">{{ item.name }}</div>
            <div class="text-caption text-grey">{{ item.alias }}</div>
          </div>
        </template>

        <template #item.selectedCalendars="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <VChip
              v-for="calendar in item.selectedCalendars.slice(0, 3)"
              :key="calendar.id"
              size="small"
              variant="tonal"
              :color="getCalendarColor(calendar.category)"
            >
              {{ calendar.name }}
            </VChip>
            <VChip
              v-if="item.selectedCalendars.length > 3"
              size="small"
              variant="outlined"
              color="grey"
            >
              +{{ item.selectedCalendars.length - 3 }} more
            </VChip>
          </div>
        </template>

        <template #item.layout="{ item }">
          <div class="d-flex align-center">
            <VIcon
              icon="mdi-view-grid"
              size="14"
              color="grey"
              class="mr-2"
            />
            <span class="text-body-2">{{ item.columnCount }} cols, {{ item.paddingPx }}px</span>
          </div>
        </template>

        <template #item.createdBy="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="24"
              color="primary"
              class="mr-2"
            >
              <span class="text-caption font-weight-bold">
                {{ (item.createdBy.displayName || item.createdBy.username).charAt(0).toUpperCase() }}
              </span>
            </VAvatar>
            <span class="text-body-2">{{ item.createdBy.displayName || item.createdBy.username }}</span>
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <span class="text-body-2 text-grey">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <VBtn
              icon="mdi-eye"
              size="small"
              color="primary"
              variant="text"
              @click="previewView(item)"
            />
            <VBtn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="editView(item)"
            />
            <VBtn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteView(item)"
            />
          </div>
        </template>
      </VDataTable>
    </VCardText>

    <!-- Create View Dialog -->
    <AdminViewCreateDialog
      v-model="showCreateDialog"
      @created="handleViewCreated"
    />

    <!-- Edit View Dialog -->
    <AdminViewEditDialog
      v-model="showEditDialog"
      :view="selectedView"
      @updated="handleViewUpdated"
    />

    <!-- Enhanced Delete Confirmation Dialog -->
    <VDialog
      v-model="showDeleteDialog"
      max-width="480"
      persistent
    >
      <VCard>
        <!-- Enhanced Delete Header -->
        <VCardTitle class="d-flex align-center pa-6 bg-red-lighten-5">
          <VAvatar
            color="error"
            size="40"
            class="mr-3"
          >
            <VIcon
              icon="mdi-alert-circle"
              color="white"
              size="20"
            />
          </VAvatar>
          <div>
            <h2 class="text-h6 font-weight-bold text-red-darken-4">Confirm View Deletion</h2>
            <p class="text-body-2 text-red-darken-1 ma-0">This action cannot be undone</p>
          </div>
        </VCardTitle>

        <!-- Enhanced Delete Content -->
        <VCardText class="pa-6">
          <div class="mb-4">
            <p class="text-body-1 text-grey-darken-2 mb-3">
              You are about to permanently delete the view:
            </p>
            <div class="d-flex align-center pa-3 bg-grey-lighten-4 rounded">
              <VIcon
                icon="mdi-view-dashboard"
                color="primary"
                size="20"
                class="mr-3"
              />
              <div>
                <div class="font-weight-medium">{{ selectedView?.name }}</div>
                <div class="text-caption text-grey">{{ selectedView?.alias }}</div>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-body-2 text-grey-darken-1 mb-2">This will affect:</p>
            <VList
              density="compact"
              class="bg-transparent"
            >
              <VListItem>
                <template #prepend>
                  <VIcon
                    icon="mdi-link-variant-off"
                    color="warning"
                    size="16"
                  />
                </template>
                <VListItemTitle class="text-body-2">Public links using this view alias</VListItemTitle>
              </VListItem>
            </VList>
          </div>
        </VCardText>

        <!-- Enhanced Delete Actions -->
        <VCardActions class="pa-6 bg-grey-lighten-5 d-flex justify-end ga-3">
          <VBtn
            variant="text"
            color="grey"
            :disabled="deleting"
            @click="showDeleteDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            :loading="deleting"
            @click="confirmDelete"
          >
            <template #prepend>
              <VIcon
                icon="mdi-delete"
                size="18"
              />
            </template>
            Delete View
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
interface ViewData {
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
  createdBy: {
    id: string;
    username: string;
    displayName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const views = ref<ViewData[]>([]);
const loading = ref(false);
const deleting = ref(false);

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedView = ref<ViewData | null>(null);

const snackbarStore = useSnackbarStore();

const headers = [
  { title: "View", key: "name", sortable: true },
  { title: "Calendars", key: "selectedCalendars", sortable: false },
  { title: "Layout", key: "layout", sortable: false },
  { title: "Created By", key: "createdBy", sortable: false },
  { title: "Created", key: "createdAt", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: "120px" },
];

const fetchViews = async () => {
  loading.value = true;
  try {
    const response = await $fetch<{ views: ViewData[] }>("/api/views");
    views.value = response.views;
  } catch (error) {
    console.error("Failed to fetch views:", error);
    snackbarStore.error("Error", "Failed to load views");
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

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

const previewView = (view: ViewData) => {
  const url = `/?view=${view.alias}`;
  window.open(url, "_blank");
};

const editView = (view: ViewData) => {
  selectedView.value = view;
  showEditDialog.value = true;
};

const deleteView = (view: ViewData) => {
  selectedView.value = view;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!selectedView.value) return;

  deleting.value = true;
  try {
    await $fetch(`/api/views/${selectedView.value.id}`, {
      method: "DELETE",
    });
    
    snackbarStore.success("Success", "View deleted successfully");
    showDeleteDialog.value = false;
    await fetchViews();
  } catch (error) {
    console.error("Failed to delete view:", error);
    snackbarStore.error("Error", "Failed to delete view");
  } finally {
    deleting.value = false;
  }
};

const handleViewCreated = () => {
  fetchViews();
};

const handleViewUpdated = () => {
  fetchViews();
};

// Load views on mount
onMounted(() => {
  fetchViews();
});
</script>