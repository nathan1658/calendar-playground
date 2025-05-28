<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Calendar Management</span>
      <VBtn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Create Calendar
      </VBtn>
    </VCardTitle>

    <VCardText>
      <VDataTable
        :headers="headers"
        :items="calendars"
        :loading="loading"
        item-value="id"
        class="elevation-1"
      >
        <template #item.owner="{ item }">
          <VChip
            v-if="item.owner"
            size="small"
            color="primary"
            variant="outlined"
          >
            {{ item.owner.displayName || item.owner.username }}
          </VChip>
          <span
            v-else
            class="text-grey"
          >
            No owner
          </span>
        </template>

        <template #item.permissions="{ item }">
          <VChip
            size="small"
            color="info"
            variant="outlined"
          >
            {{ item.permissions.length }} users
          </VChip>
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon="mdi-eye"
            size="small"
            variant="text"
            @click="viewCalendar(item)"
          />
          <VBtn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="editCalendar(item)"
          />
          <VBtn
            icon="mdi-account-multiple"
            size="small"
            variant="text"
            @click="managePermissions(item)"
          />
          <VBtn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="deleteCalendar(item)"
          />
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

    <!-- Delete Confirmation Dialog -->
    <VDialog
      v-model="showDeleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle>Confirm Delete</VCardTitle>
        <VCardText>
          Are you sure you want to delete the calendar "{{ selectedCalendar?.name }}"? This action cannot be undone.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            text
            @click="showDeleteDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            :loading="deleting"
            @click="confirmDelete"
          >
            Delete
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
  { title: "Name", key: "name", sortable: true },
  { title: "Category", key: "category", sortable: true },
  { title: "Owner", key: "owner", sortable: false },
  { title: "Permissions", key: "permissions", sortable: false },
  { title: "Created", key: "createdAt", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
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
