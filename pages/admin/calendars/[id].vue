<template>
  <div class="page-container">
    <!-- Header Section -->
    <div class="page-header stagger-item">
      <div class="d-flex align-center">
        <VBtn
          icon="mdi-arrow-left"
          variant="text"
          size="small"
          color="grey-darken-1"
          class="mr-3"
          @click="$router.back()"
        />
        <div>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            {{ calendar?.name || "Calendar Details" }}
          </h1>
          <p class="text-body-2 text-grey-darken-1 mt-1">Manage calendar settings and permissions</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center pa-8">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <!-- Main Content -->
    <div v-else-if="calendar" class="content-grid">
      <div class="main-column">
        <!-- Calendar Information Card -->
        <BaseCard
          title="Calendar Information"
          icon="mdi-calendar"
          class="stagger-item mb-6"
          :actions="[{
            text: 'Edit',
            onClick: () => showEditDialog = true,
            variant: 'outlined',
            color: 'primary',
            icon: 'mdi-pencil'
          }]"
        >
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Name</div>
              <div class="info-value">{{ calendar.name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Category</div>
              <div class="info-value">{{ calendar.category || "No category" }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Owner</div>
              <div class="info-value">
                {{ calendar.owner?.displayName || calendar.owner?.username || "No owner" }}
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Created</div>
              <div class="info-value">{{ formatDate(calendar.createdAt) }}</div>
            </div>
          </div>
        </BaseCard>

        <!-- Permissions Card -->
        <BaseCard
          :title="`Permissions (${calendar.permissions.length})`"
          icon="mdi-account-multiple"
          class="stagger-item"
          :actions="[{
            text: 'Manage Permissions',
            onClick: () => showPermissionsDialog = true,
            variant: 'outlined',
            color: 'primary',
            icon: 'mdi-account-plus'
          }]"
        >
          <VDataTable
            :headers="permissionHeaders"
            :items="calendar.permissions"
            item-value="userId"
            class="permissions-table"
            hide-default-footer
            :items-per-page="-1"
          >
            <template #item.user="{ item }">
              <div class="user-info">
                <div class="user-name">
                  {{ item.user.displayName || item.user.username }}
                </div>
                <div class="user-username text-caption text-grey">
                  {{ item.user.username }}
                </div>
              </div>
            </template>

            <template #item.accessLevel="{ item }">
              <VChip
                :color="item.accessLevel === 'edit' ? 'success' : 'info'"
                size="small"
                variant="tonal"
                class="font-weight-medium"
              >
                {{ item.accessLevel }}
              </VChip>
            </template>

            <template #no-data>
              <div class="empty-state">
                <VIcon icon="mdi-account-plus" size="48" color="grey-lighten-1" class="mb-3" />
                <div class="text-body-1 text-grey">No permissions assigned yet</div>
                <div class="text-body-2 text-grey-lighten-1 mt-1">Click "Manage Permissions" to add users</div>
              </div>
            </template>
          </VDataTable>
        </BaseCard>
      </div>

      <!-- Side Panel -->
      <div class="side-column">
        <BaseCard
          title="Quick Actions"
          icon="mdi-lightning-bolt"
          class="stagger-item"
        >
          <div class="actions-list">
            <div class="action-item" @click="showEditDialog = true">
              <div class="action-icon">
                <VIcon icon="mdi-pencil" size="20" color="primary" />
              </div>
              <div class="action-content">
                <div class="action-title">Edit Calendar</div>
                <div class="action-subtitle">Update name and category</div>
              </div>
            </div>
            
            <div class="action-item" @click="showPermissionsDialog = true">
              <div class="action-icon">
                <VIcon icon="mdi-account-multiple" size="20" color="info" />
              </div>
              <div class="action-content">
                <div class="action-title">Manage Permissions</div>
                <div class="action-subtitle">Add or remove user access</div>
              </div>
            </div>
            
            <div class="action-item danger" @click="showDeleteDialog = true">
              <div class="action-icon">
                <VIcon icon="mdi-delete" size="20" color="error" />
              </div>
              <div class="action-content">
                <div class="action-title">Delete Calendar</div>
                <div class="action-subtitle">Permanently remove calendar</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <BaseCard icon="mdi-alert-circle" color="error">
        <div class="text-center">
          <VIcon icon="mdi-calendar-remove" size="64" color="error" class="mb-4" />
          <div class="text-h6 mb-2">Calendar not found</div>
          <div class="text-body-2 text-grey mb-4">The calendar you're looking for doesn't exist or has been deleted.</div>
          <VBtn variant="outlined" color="primary" @click="$router.push('/admin/calendars')">
            Back to Calendars
          </VBtn>
        </div>
      </BaseCard>
    </div>

    <!-- Edit Dialog -->
    <AdminCalendarEditDialog
      v-model="showEditDialog"
      :calendar="calendar"
      @updated="fetchCalendar"
    />

    <!-- Permissions Dialog -->
    <AdminCalendarPermissionsDialog
      v-model="showPermissionsDialog"
      :calendar="calendar"
      @updated="fetchCalendar"
    />

    <!-- Delete Confirmation Dialog -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Confirm Delete"
      icon="mdi-alert-circle"
      icon-color="error"
      max-width="480"
      :actions="[
        {
          text: 'Cancel',
          onClick: () => showDeleteDialog = false,
          variant: 'text'
        },
        {
          text: 'Delete',
          onClick: confirmDelete,
          color: 'error',
          loading: deleting
        }
      ]"
    >
      <div class="text-center">
        <VIcon icon="mdi-delete-alert" size="64" color="error" class="mb-4" />
        <div class="text-body-1 mb-2">
          Are you sure you want to delete the calendar <strong>"{{ calendar?.name }}"</strong>?
        </div>
        <div class="text-body-2 text-grey">
          This action cannot be undone and will permanently remove all associated events.
        </div>
      </div>
    </BaseDialog>
  </div>
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

// Set page meta - removed admin layout, will use default
definePageMeta({
  middleware: "admin",
});

const route = useRoute();
const router = useRouter();
const calendarId = route.params.id as string;

const calendar = ref<Calendar | null>(null);
const loading = ref(false);
const deleting = ref(false);

const showEditDialog = ref(false);
const showPermissionsDialog = ref(false);
const showDeleteDialog = ref(false);

const permissionHeaders = [
  { title: "User", key: "user", sortable: false },
  { title: "Access Level", key: "accessLevel", sortable: true },
];

const fetchCalendar = async () => {
  loading.value = true;
  try {
    const response = await $fetch<{ calendar: Calendar }>(`/api/calendars/${calendarId}`);
    calendar.value = response.calendar;
  } catch (error) {
    console.error("Failed to fetch calendar:", error);
    calendar.value = null;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const confirmDelete = async () => {
  if (!calendar.value) return;

  deleting.value = true;
  try {
    await $fetch(`/api/calendars/${calendar.value.id}`, {
      method: "DELETE",
    });

    showDeleteDialog.value = false;
    await router.push("/admin/calendars");
  } catch (error) {
    console.error("Failed to delete calendar:", error);
  } finally {
    deleting.value = false;
  }
};

// Set page head
useHead({
  title: computed(() => `${calendar.value?.name || "Calendar"} - Admin`),
});

// Fetch calendar on mount
onMounted(() => {
  fetchCalendar();
});
</script>

<style scoped>
/* Page Layout */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 64px);
}

.page-header {
  margin-bottom: 32px;
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: start;
}

.main-column {
  min-width: 0;
}

.side-column {
  position: sticky;
  top: 24px;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.info-item {
  padding: 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-item:hover {
  background: rgba(var(--v-theme-surface), 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  word-break: break-word;
}

/* Permissions Table */
.permissions-table {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.permissions-table .v-table__wrapper) {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.permissions-table .v-data-table-header) {
  background: rgba(var(--v-theme-surface), 0.5);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

:deep(.permissions-table .v-data-table__tr) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.permissions-table .v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.04);
}

.user-info {
  padding: 8px 0;
}

.user-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 2px;
}

.user-username {
  color: rgba(0, 0, 0, 0.6);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

/* Actions List */
.actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(var(--v-theme-surface), 0.3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-item:hover {
  background: rgba(var(--v-theme-surface), 0.8);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-item.danger:hover {
  background: rgba(var(--v-theme-error), 0.05);
  border-color: rgba(var(--v-theme-error), 0.2);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--v-theme-surface), 0.8);
  margin-right: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-item:hover .action-icon {
  transform: scale(1.1);
}

.action-content {
  flex: 1;
}

.action-title {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 4px;
}

.action-subtitle {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
}

/* Error State */
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* Stagger Animation */
.stagger-item {
  opacity: 0;
  animation: staggerIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.stagger-item:nth-child(1) {
  animation-delay: 0.1s;
}
.stagger-item:nth-child(2) {
  animation-delay: 0.2s;
}
.stagger-item:nth-child(3) {
  animation-delay: 0.3s;
}
.stagger-item:nth-child(4) {
  animation-delay: 0.4s;
}
.stagger-item:nth-child(5) {
  animation-delay: 0.5s;
}

@keyframes staggerIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .side-column {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .page-header {
    margin-bottom: 24px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-item {
    padding: 12px;
  }
  
  .action-icon {
    width: 36px;
    height: 36px;
    margin-right: 12px;
  }
}

/* Focus states for accessibility */
.action-item:focus {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Enhanced loading state */
:deep(.v-progress-circular) {
  filter: drop-shadow(0 4px 12px rgba(var(--v-theme-primary), 0.3));
}
</style>
