<template>
  <VApp>
    <VNavigationDrawer
      v-model="drawer"
      app
      clipped
      :width="280"
    >
      <!-- Enhanced User Section -->
      <div v-if="currentUser" class="pa-4 border-b">
        <VCard variant="outlined" class="pa-3 bg-grey-lighten-5">
          <div class="d-flex align-center">
            <VAvatar
              size="44"
              color="primary"
              class="mr-3"
            >
              <span class="text-h6 font-weight-bold">
                {{ (currentUser.displayName || currentUser.username).charAt(0).toUpperCase() }}
              </span>
            </VAvatar>
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-bold text-grey-darken-4">
                {{ currentUser.displayName || currentUser.username }}
              </div>
              <div class="d-flex align-center mt-1">
                <VIcon 
                  :icon="isAdmin ? 'mdi-shield-crown' : 'mdi-account'" 
                  size="12" 
                  :color="isAdmin ? 'warning' : 'grey'"
                  class="mr-1"
                />
                <span class="text-caption text-grey">{{ isAdmin ? "Administrator" : "User" }}</span>
              </div>
            </div>
          </div>
        </VCard>
      </div>

      <!-- Enhanced Main Navigation -->
      <VList class="pa-2">
        <VListSubheader class="text-overline font-weight-bold text-primary">Main</VListSubheader>
        <VListItem
          to="/"
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          :active="$route.path === '/'"
          rounded="lg"
          class="mb-1"
        />
        <VListItem
          to="/calendar"
          prepend-icon="mdi-calendar"
          title="Calendar View"
          value="calendar"
          :active="$route.path === '/calendar'"
          rounded="lg"
          class="mb-1"
        />
        <VListItem
          to="/calendars"
          prepend-icon="mdi-calendar-multiple"
          title="My Calendars"
          value="calendars"
          :active="$route.path === '/calendars'"
          rounded="lg"
          class="mb-1"
        />
      </VList>

      <!-- Enhanced Admin Section -->
      <template v-if="isAdmin">
        <VDivider />
        <VList class="pa-2">
          <VListSubheader class="text-overline font-weight-bold text-warning">Administration</VListSubheader>
          <VListItem
            to="/admin"
            prepend-icon="mdi-shield-crown"
            title="Admin Dashboard"
            value="admin"
            :active="$route.path === '/admin'"
            rounded="lg"
            class="mb-1"
          >
            <template #prepend>
              <VIcon icon="mdi-shield-crown" color="warning" />
            </template>
          </VListItem>
          <VListItem
            to="/admin/calendars"
            prepend-icon="mdi-calendar-multiple-check"
            title="Manage Calendars"
            value="admin-calendars"
            :active="$route.path.startsWith('/admin/calendars')"
            rounded="lg"
            class="mb-1"
          />
          <VListItem
            to="/admin/users"
            prepend-icon="mdi-account-multiple"
            title="Manage Users"
            value="admin-users"
            :active="$route.path === '/admin/users'"
            rounded="lg"
            class="mb-1"
          />
        </VList>
      </template>

      <!-- Enhanced Quick Actions -->
      <template v-if="currentUser">
        <VDivider />
        <div class="pa-4">
          <VBtn
            color="primary"
            variant="elevated"
            block
            prepend-icon="mdi-plus"
            @click="handleCreateEvent"
          >
            Create Event
          </VBtn>
        </div>
      </template>

      <!-- Enhanced Footer -->
      <template #append>
        <VDivider v-if="currentUser" />
        <div v-if="currentUser" class="pa-4">
          <VBtn
            variant="text"
            color="error"
            block
            prepend-icon="mdi-logout"
            @click="handleLogout"
          >
            Logout
          </VBtn>
        </div>
      </template>
    </VNavigationDrawer>

    <VAppBar
      app
      clipped-left
      color="primary"
      elevation="2"
    >
      <VAppBarNavIcon @click="drawer = !drawer" />

      <VToolbarTitle class="d-flex align-center">
        <VAvatar
          color="white"
          size="32"
          class="mr-3"
        >
          <VIcon
            icon="mdi-calendar-multiple"
            color="primary"
            size="18"
          />
        </VAvatar>
        <span class="text-h6 font-weight-bold">Calendar App</span>
      </VToolbarTitle>

      <VSpacer />

      <!-- Enhanced Breadcrumbs for larger screens -->
      <VBreadcrumbs
        v-if="$vuetify.display.mdAndUp && breadcrumbs.length > 1"
        :items="breadcrumbs"
        class="d-none d-md-flex"
        color="white"
        divider="mdi-chevron-right"
      />

      <VSpacer />

      <!-- Enhanced User Section -->
      <div v-if="status === 'authenticated' && currentUser">
        <BaseUserAvatar :user="currentUser" />
      </div>

      <!-- Loading state -->
      <VProgressCircular
        v-else-if="status === 'loading'"
        indeterminate
        size="24"
        width="2"
        color="white"
      />

      <!-- Enhanced Login button -->
      <VBtn
        v-else
        variant="outlined"
        color="white"
        @click="navigateTo('/login')"
      >
        <template #prepend>
          <VIcon icon="mdi-login" size="18" />
        </template>
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
  font-weight: 600;
}
</style>
