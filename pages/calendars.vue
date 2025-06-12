<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">My Calendars</h1>
            <p class="text-subtitle-1 text-grey mt-1">
              {{ isAdmin ? "All calendars in the system" : "Calendars you have access to" }}
            </p>
          </div>
          <div class="d-flex ga-2">
            <VBtn
              v-if="isAdmin"
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-cog"
              @click="navigateTo('/admin/calendars')"
            >
              Manage Calendars
            </VBtn>
            <VBtn
              color="primary"
              prepend-icon="mdi-calendar"
              @click="navigateTo('/calendar')"
            >
              View Calendar
            </VBtn>
          </div>
        </div>
      </VCol>
    </VRow>

    <VRow v-if="loading">
      <VCol cols="12">
        <VSkeletonLoader type="table" />
      </VCol>
    </VRow>

    <VRow v-else-if="calendars.length > 0">
      <VCol cols="12">
        <VCard>
          <VCardText>
            <VDataTable
              :headers="headers"
              :items="calendars"
              :loading="loading"
              item-value="id"
              class="elevation-1"
            >
              <template #item.name="{ item }">
                <div class="d-flex align-center">
                  <VIcon
                    :icon="getCategoryIcon(item.category)"
                    :color="getCategoryColor(item.category)"
                    class="mr-2"
                  />
                  <div>
                    <div class="font-weight-medium">{{ item.name }}</div>
                    <div
                      v-if="item.category"
                      class="text-caption text-grey"
                    >
                      {{ item.category }}
                    </div>
                  </div>
                </div>
              </template>

              <template #item.owner="{ item }">
                <VChip
                  v-if="item.owner"
                  size="small"
                  :color="item.owner.id === currentUserId ? 'primary' : 'default'"
                  variant="outlined"
                >
                  {{ item.owner.displayName || item.owner.username }}
                  <VTooltip
                    v-if="item.owner.id === currentUserId"
                    activator="parent"
                    location="top"
                  >
                    You are the owner
                  </VTooltip>
                </VChip>
                <span
                  v-else
                  class="text-grey"
                >
                  No owner
                </span>
              </template>

              <template #item.myAccess="{ item }">
                <VChip
                  :color="getAccessColor(item.myAccess)"
                  size="small"
                  variant="outlined"
                >
                  {{ item.myAccess }}
                </VChip>
              </template>

              <template #item.userCount="{ item }">
                <VChip
                  size="small"
                  color="info"
                  variant="outlined"
                >
                  {{ item.permissions.length }} {{ item.permissions.length === 1 ? "user" : "users" }}
                </VChip>
              </template>

              <template #item.createdAt="{ item }">
                <div class="text-caption">{{ formatDate(item.createdAt) }}</div>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex ga-1">
                  <VBtn
                    icon="mdi-calendar"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="viewCalendar(item)"
                  >
                    <VTooltip
                      activator="parent"
                      location="top"
                    >
                      View in Calendar
                    </VTooltip>
                  </VBtn>
                  <VBtn
                    v-if="isAdmin || item.owner?.id === currentUserId"
                    icon="mdi-cog"
                    size="small"
                    variant="text"
                    color="secondary"
                    @click="manageCalendar(item)"
                  >
                    <VTooltip
                      activator="parent"
                      location="top"
                    >
                      Manage Calendar
                    </VTooltip>
                  </VBtn>
                </div>
              </template>

              <template #no-data>
                <div class="text-center pa-4">
                  <VIcon
                    icon="mdi-calendar-blank"
                    size="48"
                    class="text-grey mb-2"
                  />
                  <div class="text-h6 text-grey">No calendars found</div>
                  <div class="text-body-2 text-grey">
                    {{
                      isAdmin ? "No calendars have been created yet." : "You don't have access to any calendars yet."
                    }}
                  </div>
                </div>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow v-else>
      <VCol cols="12">
        <VCard>
          <VCardText class="text-center pa-8">
            <VIcon
              icon="mdi-calendar-blank"
              size="64"
              class="text-grey mb-4"
            />
            <div class="text-h5 text-grey mb-2">No calendars available</div>
            <div class="text-body-1 text-grey mb-4">
              {{ isAdmin ? "No calendars have been created yet." : "You don't have access to any calendars." }}
            </div>
            <VBtn
              v-if="isAdmin"
              color="primary"
              prepend-icon="mdi-plus"
              @click="navigateTo('/admin/calendars')"
            >
              Create First Calendar
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

  </VContainer>
</template>

<script setup lang="ts">
interface CalendarApiResponse {
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

interface Calendar extends CalendarApiResponse {
  myAccess: "owner" | "edit" | "view";
}

// Page metadata
definePageMeta({
  title: "My Calendars",
  requiresAuth: true,
});

// Auth composable
const { data } = useAuth();
const sessionData = data as unknown as {
  user: { id: string; username: string; displayName?: string; roles: string[] };
} | null;

// Computed properties
const currentUserId = computed(() => sessionData?.user?.id);
const isAdmin = computed(() => sessionData?.user?.roles?.includes("admin") || false);

// Reactive state
const calendars = ref<Calendar[]>([]);
const loading = ref(false);
const snackbarStore = useSnackbarStore();

// Table headers
const headers = computed(() => [
  { title: "Calendar", key: "name", sortable: true },
  { title: "Owner", key: "owner", sortable: false },
  { title: "My Access", key: "myAccess", sortable: true },
  { title: "Users", key: "userCount", sortable: false },
  { title: "Created", key: "createdAt", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
]);

// Methods
const fetchCalendars = async () => {
  loading.value = true;
  try {
    const response = await $fetch<{ calendars: CalendarApiResponse[] }>("/api/calendars");
    calendars.value = response.calendars.map(cal => ({
      ...cal,
      myAccess: getMyAccessLevel(cal),
    }));
  } catch {
    snackbarStore.error("Error", "Failed to fetch calendars");
  } finally {
    loading.value = false;
  }
};

const getMyAccessLevel = (calendar: CalendarApiResponse): "owner" | "edit" | "view" => {
  if (calendar.owner?.id === currentUserId.value) {
    return "owner";
  }

  const userPermission = calendar.permissions.find(p => p.userId === currentUserId.value);

  return userPermission?.accessLevel || "view";
};

const getCategoryIcon = (category?: string): string => {
  const icons: Record<string, string> = {
    personal: "mdi-account",
    work: "mdi-briefcase",
    family: "mdi-home-heart",
    project: "mdi-folder-multiple",
    default: "mdi-calendar",
  };
  return icons[category || "default"] || icons.default;
};

const getCategoryColor = (category?: string): string => {
  const colors: Record<string, string> = {
    personal: "blue",
    work: "orange",
    family: "green",
    project: "purple",
    default: "grey",
  };
  return colors[category || "default"] || colors.default;
};

const getAccessColor = (access: string): string => {
  const colors: Record<string, string> = {
    owner: "success",
    edit: "warning",
    view: "info",
  };
  return colors[access] || "default";
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const viewCalendar = (_calendar: Calendar) => {
  // Navigate to the main calendar view
  // Could potentially add calendar filtering in the future
  navigateTo("/calendar");
};

const manageCalendar = (calendar: Calendar) => {
  if (isAdmin.value) {
    navigateTo(`/admin/calendars/${calendar.id}`);
  } else {
    // For regular users, could show a basic calendar info/settings modal
    // For now, just redirect to admin (which will be blocked by middleware)
    navigateTo(`/admin/calendars/${calendar.id}`);
  }
};


// Set page head
useHead({
  title: "My Calendars",
});

// Fetch calendars on mount
onMounted(() => {
  fetchCalendars();
});
</script>

<style scoped>
.v-data-table {
  background: transparent;
}
</style>
