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
            icon="mdi-calendar-multiple-check"
            color="white"
            size="20"
          />
        </VAvatar>
        <div>
          <h2 class="text-h6 font-weight-bold text-grey-darken-4">Calendar Management</h2>
          <p class="text-body-2 text-grey-darken-1 ma-0">Manage all calendars and their permissions</p>
        </div>
      </div>
      <VBtn
        color="primary"
        @click="showCreateDialog = true"
      >
        <template #prepend>
          <VIcon icon="mdi-plus" size="18" />
        </template>
        Create Calendar
      </VBtn>
    </VCardTitle>

    <VCardText class="pa-0">
      <VDataTable
        :headers="headers"
        :items="calendars"
        :loading="loading"
        item-value="id"
        hover
        :items-per-page="15"
        :items-per-page-options="[10, 15, 25, 50]"
      >
        <template #item.name="{ item }">
          <div class="py-2">
            <div class="font-weight-medium text-grey-darken-4">{{ item.name }}</div>
            <div v-if="item.category" class="text-caption text-grey">{{ item.category }}</div>
          </div>
        </template>

        <template #item.owner="{ item }">
          <div v-if="item.owner" class="d-flex align-center">
            <VAvatar 
              size="24"
              color="primary"
              class="mr-2"
            >
              <span class="text-caption font-weight-bold">
                {{ (item.owner.displayName || item.owner.username).charAt(0).toUpperCase() }}
              </span>
            </VAvatar>
            <span class="text-body-2">{{ item.owner.displayName || item.owner.username }}</span>
          </div>
          <span v-else class="text-body-2 text-grey font-italic">No owner</span>
        </template>

        <template #item.isPublic="{ item }">
          <VChip
            v-if="item.isPublic"
            color="success"
            size="small"
            variant="tonal"
          >
            <VIcon icon="mdi-earth" size="12" class="mr-1" />
            Public
          </VChip>
          <VChip
            v-else
            color="grey"
            size="small"
            variant="outlined"
          >
            <VIcon icon="mdi-lock" size="12" class="mr-1" />
            Private
          </VChip>
        </template>

        <template #item.permissions="{ item }">
          <div class="d-flex align-center">
            <VIcon icon="mdi-account-multiple" size="14" color="grey" class="mr-2" />
            <span class="text-body-2">{{ item.permissions.length }} users</span>
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
              variant="text"
              color="primary"
              @click="viewCalendar(item)"
            >
              <VTooltip activator="parent" location="top">View Calendar</VTooltip>
            </VBtn>
            <VBtn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="editCalendar(item)"
            >
              <VTooltip activator="parent" location="top">Edit Calendar</VTooltip>
            </VBtn>
            <VBtn
              icon="mdi-account-multiple"
              size="small"
              variant="text"
              color="warning"
              @click="managePermissions(item)"
            >
              <VTooltip activator="parent" location="top">Manage Permissions</VTooltip>
            </VBtn>
            <VBtn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteCalendar(item)"
            >
              <VTooltip activator="parent" location="top">Delete Calendar</VTooltip>
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCardText>

    <!-- Create Calendar Dialog -->
    <AdminCalendarCreateDialog
      v-model="showCreateDialog"
      @created="handleCalendarCreated"
    />

    <!-- Edit Calendar Dialog -->
    <AdminCalendarEditDialog
      v-model="showEditDialog"
      :calendar="selectedCalendar"
      @updated="handleCalendarUpdated"
    />

    <!-- Permissions Dialog -->
    <AdminCalendarPermissionsDialog
      v-model="showPermissionsDialog"
      :calendar="selectedCalendar"
      @updated="handleCalendarUpdated"
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
            <h2 class="text-h6 font-weight-bold text-red-darken-4">Confirm Calendar Deletion</h2>
            <p class="text-body-2 text-red-darken-1 ma-0">This action cannot be undone</p>
          </div>
        </VCardTitle>

        <!-- Enhanced Delete Content -->
        <VCardText class="pa-6">
          <VAlert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <template #prepend>
              <VIcon icon="mdi-information" />
            </template>
            <div>
              <div class="font-weight-medium">
                You are about to permanently delete the calendar:
              </div>
              <div class="font-weight-bold mt-1">
                "{{ selectedCalendar?.name }}"
              </div>
            </div>
          </VAlert>
          
          <div class="text-body-2 text-grey-darken-1">
            <p class="mb-2 font-weight-medium">This will also delete:</p>
            <VList density="compact" class="bg-transparent">
              <VListItem>
                <template #prepend>
                  <VIcon icon="mdi-circle-small" size="16" color="grey" />
                </template>
                <VListItemTitle class="text-body-2">All events in this calendar</VListItemTitle>
              </VListItem>
              <VListItem>
                <template #prepend>
                  <VIcon icon="mdi-circle-small" size="16" color="grey" />
                </template>
                <VListItemTitle class="text-body-2">All permission settings</VListItemTitle>
              </VListItem>
              <VListItem>
                <template #prepend>
                  <VIcon icon="mdi-circle-small" size="16" color="grey" />
                </template>
                <VListItemTitle class="text-body-2">Calendar history and metadata</VListItemTitle>
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
              <VIcon icon="mdi-delete" size="18" />
            </template>
            Delete Calendar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
interface Calendar {
  id: string;
  name: string;
  category?: string;
  isPublic?: boolean;
  owner?: {
    id: string;
    username: string;
    displayName?: string;
  };
  permissions: Array<{
    userId: string;
    accessLevel: "view" | "edit";
    user: {
      id: string;
      username: string;
      displayName?: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

const calendars = ref<Calendar[]>([]);
const loading = ref(false);
const deleting = ref(false);

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showPermissionsDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedCalendar = ref<Calendar | null>(null);

const headers = [
  { title: "Calendar", key: "name", sortable: true },
  { title: "Visibility", key: "isPublic", sortable: true },
  { title: "Owner", key: "owner", sortable: false },
  { title: "Access", key: "permissions", sortable: false },
  { title: "Created", key: "createdAt", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: "140px" },
];

const fetchCalendars = async () => {
  loading.value = true;
  try {
    const response = await $fetch<{ calendars: Calendar[] }>("/api/calendars");
    calendars.value = response.calendars;
  } catch (error) {
    console.error("Failed to fetch calendars:", error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const viewCalendar = (calendar: Calendar) => {
  // Navigate to calendar detail view
  navigateTo(`/admin/calendars/${calendar.id}`);
};

const editCalendar = (calendar: Calendar) => {
  selectedCalendar.value = calendar;
  showEditDialog.value = true;
};

const managePermissions = (calendar: Calendar) => {
  selectedCalendar.value = calendar;
  showPermissionsDialog.value = true;
};

const deleteCalendar = (calendar: Calendar) => {
  selectedCalendar.value = calendar;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!selectedCalendar.value) return;

  deleting.value = true;
  try {
    await $fetch(`/api/calendars/${selectedCalendar.value.id}`, {
      method: "DELETE",
    });

    showDeleteDialog.value = false;
    await fetchCalendars(); // Refresh the list
  } catch (error) {
    console.error("Failed to delete calendar:", error);
  } finally {
    deleting.value = false;
  }
};

const handleCalendarCreated = () => {
  fetchCalendars(); // Refresh the list
};

const handleCalendarUpdated = () => {
  fetchCalendars(); // Refresh the list
};

// Fetch calendars on component mount
onMounted(() => {
  fetchCalendars();
});
</script>

