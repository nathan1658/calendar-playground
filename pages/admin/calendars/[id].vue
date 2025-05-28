<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <VBtn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.back()"
            />
            <h1 class="text-h4 font-weight-bold d-inline-block ml-2">
              {{ calendar?.name || "Calendar Details" }}
            </h1>
          </div>
          <VBreadcrumbs
            :items="breadcrumbs"
            divider="/"
          />
        </div>
      </VCol>
    </VRow>

    <VRow v-if="loading">
      <VCol cols="12">
        <VSkeletonLoader type="card" />
      </VCol>
    </VRow>

    <VRow v-else-if="calendar">
      <VCol
        cols="12"
        md="8"
      >
        <VCard class="mb-4">
          <VCardTitle class="d-flex justify-space-between align-center">
            <span>Calendar Information</span>
            <VBtn
              color="primary"
              prepend-icon="mdi-pencil"
              @click="showEditDialog = true"
            >
              Edit
            </VBtn>
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <div class="mb-4">
                  <div class="text-subtitle-2 text-grey">Name</div>
                  <div class="text-h6">{{ calendar.name }}</div>
                </div>
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <div class="mb-4">
                  <div class="text-subtitle-2 text-grey">Category</div>
                  <div class="text-h6">{{ calendar.category || "No category" }}</div>
                </div>
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <div class="mb-4">
                  <div class="text-subtitle-2 text-grey">Owner</div>
                  <div class="text-h6">
                    {{ calendar.owner?.displayName || calendar.owner?.username || "No owner" }}
                  </div>
                </div>
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <div class="mb-4">
                  <div class="text-subtitle-2 text-grey">Created</div>
                  <div class="text-h6">{{ formatDate(calendar.createdAt) }}</div>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <VCard>
          <VCardTitle class="d-flex justify-space-between align-center">
            <span>Permissions ({{ calendar.permissions.length }})</span>
            <VBtn
              color="primary"
              prepend-icon="mdi-account-plus"
              @click="showPermissionsDialog = true"
            >
              Manage Permissions
            </VBtn>
          </VCardTitle>
          <VCardText>
            <VDataTable
              :headers="permissionHeaders"
              :items="calendar.permissions"
              item-value="userId"
              class="elevation-1"
            >
              <template #item.user="{ item }">
                <div>
                  <div class="font-weight-medium">
                    {{ item.user.displayName || item.user.username }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ item.user.username }}
                  </div>
                </div>
              </template>

              <template #item.accessLevel="{ item }">
                <VChip
                  :color="item.accessLevel === 'edit' ? 'success' : 'info'"
                  size="small"
                  variant="outlined"
                >
                  {{ item.accessLevel }}
                </VChip>
              </template>

              <template #no-data>
                <div class="text-center pa-4">No permissions assigned yet</div>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardTitle>Quick Actions</VCardTitle>
          <VCardText>
            <VList>
              <VListItem
                prepend-icon="mdi-pencil"
                title="Edit Calendar"
                subtitle="Update name and category"
                @click="showEditDialog = true"
              />
              <VListItem
                prepend-icon="mdi-account-multiple"
                title="Manage Permissions"
                subtitle="Add or remove user access"
                @click="showPermissionsDialog = true"
              />
              <VListItem
                prepend-icon="mdi-delete"
                title="Delete Calendar"
                subtitle="Permanently remove calendar"
                @click="showDeleteDialog = true"
              />
            </VList>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow v-else>
      <VCol cols="12">
        <VAlert type="error">Calendar not found</VAlert>
      </VCol>
    </VRow>

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
    <VDialog
      v-model="showDeleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle>Confirm Delete</VCardTitle>
        <VCardText>
          Are you sure you want to delete the calendar "{{ calendar?.name }}"? This action cannot be undone.
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
  </VContainer>
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

const breadcrumbs = computed(() => [
  {
    title: "Admin",
    disabled: false,
    href: "/admin",
  },
  {
    title: "Calendars",
    disabled: false,
    href: "/admin/calendars",
  },
  {
    title: calendar.value?.name || "Calendar",
    disabled: true,
    href: `/admin/calendars/${calendarId}`,
  },
]);

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
