<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Admin Dashboard</h1>
            <p class="text-subtitle-1 text-grey mt-1">System administration and management</p>
          </div>
          <VBreadcrumbs
            :items="breadcrumbs"
            divider="/"
          />
        </div>
      </VCol>
    </VRow>

    <VRow>
      <VCol
        cols="12"
        md="6"
        lg="4"
      >
        <VCard
          class="text-center admin-card"
          hover
          @click="navigateTo('/admin/calendars')"
        >
          <VCardText>
            <VIcon
              size="64"
              color="primary"
              class="mb-4"
            >
              mdi-calendar-multiple
            </VIcon>
            <h3 class="text-h5 mb-2">Calendar Management</h3>
            <p class="text-body-2">Create, edit, and manage calendars and their permissions</p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="6"
        lg="4"
      >
        <VCard
          class="text-center admin-card"
          hover
          @click="navigateTo('/admin/users')"
        >
          <VCardText>
            <VIcon
              size="64"
              color="primary"
              class="mb-4"
            >
              mdi-account-multiple
            </VIcon>
            <h3 class="text-h5 mb-2">User Management</h3>
            <p class="text-body-2">Manage user accounts and their roles</p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="6"
        lg="4"
      >
        <VCard
          class="text-center admin-card"
          hover
        >
          <VCardText>
            <VIcon
              size="64"
              color="grey"
              class="mb-4"
            >
              mdi-chart-line
            </VIcon>
            <h3 class="text-h5 mb-2">Analytics</h3>
            <p class="text-body-2">View system usage and statistics (Coming Soon)</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mt-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon
              icon="mdi-chart-box"
              class="mr-2"
            />
            Quick Stats
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="3"
              >
                <div class="text-center">
                  <div class="text-h4 text-primary font-weight-bold">
                    {{ stats.totalCalendars }}
                  </div>
                  <div class="text-body-2">Total Calendars</div>
                </div>
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <div class="text-center">
                  <div class="text-h4 text-success font-weight-bold">
                    {{ stats.totalUsers }}
                  </div>
                  <div class="text-body-2">Total Users</div>
                </div>
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <div class="text-center">
                  <div class="text-h4 text-info font-weight-bold">
                    {{ stats.activeUsers }}
                  </div>
                  <div class="text-body-2">Active Users</div>
                </div>
              </VCol>
              <VCol
                cols="12"
                md="3"
              >
                <div class="text-center">
                  <div class="text-h4 text-warning font-weight-bold">
                    {{ stats.totalPermissions }}
                  </div>
                  <div class="text-body-2">Total Permissions</div>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
interface Calendar {
  id: string;
  name: string;
  permissions: Array<{
    userId: string;
    accessLevel: "view" | "edit";
  }>;
}

// Set page meta - removed admin layout, will use default
definePageMeta({
  middleware: "admin",
});

const breadcrumbs = [
  {
    title: "Home",
    disabled: false,
    href: "/",
  },
  {
    title: "Admin Dashboard",
    disabled: true,
    href: "/admin",
  },
];

const stats = ref({
  totalCalendars: 0,
  totalUsers: 0,
  activeUsers: 0,
  totalPermissions: 0,
});

const fetchStats = async () => {
  try {
    // Fetch calendars to count them
    const calendarsResponse = await $fetch<{ calendars: Calendar[] }>("/api/calendars");
    stats.value.totalCalendars = calendarsResponse.calendars.length;

    // Calculate total permissions
    stats.value.totalPermissions = calendarsResponse.calendars.reduce(
      (total, calendar) => total + calendar.permissions.length,
      0,
    );

    // Fetch user stats
    const usersResponse = await $fetch<{ users: Array<{ id: string }> }>("/api/users");
    stats.value.totalUsers = usersResponse.users.length;
    stats.value.activeUsers = usersResponse.users.length; // For now, all users are considered active
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  }
};

// Set page head
useHead({
  title: "Admin Dashboard",
});

// Fetch stats on mount
onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.admin-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.admin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.admin-card:hover .v-icon {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}
</style>
