<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">Admin Dashboard</h1>
      </VCol>
    </VRow>

    <VRow>
      <VCol
        cols="12"
        md="6"
        lg="4"
      >
        <VCard
          class="text-center"
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
          class="text-center"
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
          class="text-center"
          hover
        >
          <VCardText>
            <VIcon
              size="64"
              color="primary"
              class="mb-4"
            >
              mdi-chart-line
            </VIcon>
            <h3 class="text-h5 mb-2">Analytics</h3>
            <p class="text-body-2">View system usage and statistics</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="mt-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle>Quick Stats</VCardTitle>
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

// Set page meta
definePageMeta({
  layout: "admin",
});

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

    // TODO: Fetch user stats when user management API is implemented
    stats.value.totalUsers = 0;
    stats.value.activeUsers = 0;
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
