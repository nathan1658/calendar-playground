<template>
  <VApp>
    <VNavigationDrawer
      v-model="drawer"
      app
      clipped
      :width="280"
    >
      <!-- User Section -->
      <VList
        v-if="currentUser"
        class="py-2"
      >
        <VListItem
          class="mb-2"
          lines="two"
        >
          <template #prepend>
            <VAvatar
              color="primary"
              size="40"
            >
              <VIcon
                icon="mdi-account"
                size="24"
              />
            </VAvatar>
          </template>
          <VListItemTitle>{{ currentUser.displayName || currentUser.username }}</VListItemTitle>
          <VListItemSubtitle>{{ isAdmin ? "Administrator" : "User" }}</VListItemSubtitle>
        </VListItem>
      </VList>

      <VDivider v-if="currentUser" />

      <!-- Main Navigation -->
      <VList class="py-2">
        <VListSubheader>Main</VListSubheader>
        <VListItem
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/"
          value="dashboard"
        />
        <VListItem
          prepend-icon="mdi-calendar"
          title="Calendar View"
          to="/calendar"
          value="calendar"
        />
        <VListItem
          prepend-icon="mdi-calendar-multiple"
          title="My Calendars"
          to="/calendars"
          value="calendars"
        />
      </VList>

      <!-- Admin Section -->
      <template v-if="isAdmin">
        <VDivider />
        <VList class="py-2">
          <VListSubheader>Administration</VListSubheader>
          <VListItem
            prepend-icon="mdi-shield-crown"
            title="Admin Dashboard"
            to="/admin"
            value="admin"
          />
          <VListItem
            prepend-icon="mdi-calendar-multiple-check"
            title="Manage Calendars"
            to="/admin/calendars"
            value="admin-calendars"
          />
          <VListItem
            prepend-icon="mdi-account-multiple"
            title="Manage Users"
            to="/admin/users"
            value="admin-users"
          />
        </VList>
      </template>

      <!-- Quick Actions -->
      <template v-if="currentUser">
        <VDivider />
        <VList class="py-2">
          <VListSubheader>Quick Actions</VListSubheader>
          <VListItem
            prepend-icon="mdi-plus"
            title="Create Event"
            value="create-event"
            @click="handleCreateEvent"
          />
        </VList>
      </template>

      <!-- Footer -->
      <template #append>
        <VDivider />
        <VList class="py-2">
          <VListItem
            v-if="currentUser"
            prepend-icon="mdi-logout"
            title="Logout"
            value="logout"
            @click="handleLogout"
          />
        </VList>
      </template>
    </VNavigationDrawer>

    <VAppBar
      app
      clipped-left
      color="primary"
      dark
      elevation="2"
    >
      <VAppBarNavIcon @click="drawer = !drawer" />

      <VToolbarTitle class="d-flex align-center">
        <VIcon
          icon="mdi-calendar-multiple"
          class="mr-2"
        />
        Calendar App
      </VToolbarTitle>

      <VSpacer />

      <!-- Breadcrumbs for larger screens -->
      <VBreadcrumbs
        v-if="$vuetify.display.mdAndUp && breadcrumbs.length > 1"
        :items="breadcrumbs"
        class="d-none d-md-flex"
        color="white"
        divider="mdi-chevron-right"
      />

      <VSpacer />

      <!-- User Avatar Component - Only show when authenticated -->
      <BaseUserAvatar
        v-if="status === 'authenticated' && currentUser"
        :user="currentUser"
      />

      <!-- Loading state -->
      <VProgressCircular
        v-else-if="status === 'loading'"
        indeterminate
        size="24"
        width="2"
        color="white"
      />

      <!-- Fallback login button -->
      <VBtn
        v-else
        variant="text"
        prepend-icon="mdi-login"
        @click="navigateTo('/login')"
      >
        Login
      </VBtn>
    </VAppBar>

    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const { data, status, signOut } = useAuth();
const route = useRoute();
const drawer = ref(true);

// Make user data properly reactive
const currentUser = computed(() => {
  const sessionData = data.value as unknown as {
    user: {
      id: string;
      username: string;
      displayName?: string;
      roles: string[];
    };
  } | null;

  return sessionData?.user
    ? {
        id: sessionData.user.id,
        username: sessionData.user.username,
        displayName: sessionData.user.displayName,
        roles: sessionData.user.roles,
      }
    : null;
});

const isAdmin = computed(() => currentUser.value?.roles?.includes("admin") || false);

// Generate breadcrumbs based on current route
const breadcrumbs = computed(() => {
  const pathSegments = route.path.split("/").filter(Boolean);
  const crumbs = [{ title: "Home", href: "/" }];

  if (pathSegments.length === 0) return crumbs;

  let currentPath = "";
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    let title = segment.charAt(0).toUpperCase() + segment.slice(1);

    // Custom titles for known routes
    switch (currentPath) {
      case "/admin":
        title = "Admin Dashboard";
        break;
      case "/admin/calendars":
        title = "Manage Calendars";
        break;
      case "/admin/users":
        title = "Manage Users";
        break;
      case "/calendar":
        title = "Calendar View";
        break;
      case "/calendars":
        title = "My Calendars";
        break;
    }

    crumbs.push({
      title,
      href: currentPath,
    });
  }

  return crumbs;
});

// Handle quick actions
const handleCreateEvent = () => {
  // Navigate to dashboard and trigger event creation
  navigateTo("/?createEvent=true");
};

const handleLogout = async () => {
  try {
    await signOut();
    await navigateTo("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Responsive drawer behavior
onMounted(() => {
  // Close drawer on mobile by default
  if (import.meta.client) {
    const { mobile } = useDisplay();
    if (mobile.value) {
      drawer.value = false;
    }
  }
});
</script>

<style scoped>
:deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
}

:deep(.v-list-subheader) {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
</style>
