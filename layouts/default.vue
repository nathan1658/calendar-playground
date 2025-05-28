<template>
  <VApp>
    <VNavigationDrawer
      v-model="drawer"
      app
      clipped
    >
      <VList>
        <VListItem
          prepend-icon="mdi-home"
          title="Home"
          to="/"
        />
        <VListItem
          v-if="isAdmin"
          prepend-icon="mdi-view-dashboard"
          title="Admin Dashboard"
          to="/admin"
        />
        <VListItem
          v-if="isAdmin"
          prepend-icon="mdi-calendar-multiple"
          title="Manage Calendars"
          to="/admin/calendars"
        />
        <VListItem
          v-if="isAdmin"
          prepend-icon="mdi-account-multiple"
          title="Manage Users"
          to="/admin/users"
        />
        <VDivider v-if="isAdmin" />
        <VListItem
          prepend-icon="mdi-calendar-multiple"
          title="My Calendars"
          to="/calendars"
        />
        <VListItem
          prepend-icon="mdi-calendar"
          title="Calendar View"
          to="/calendar"
        />
        <VListItem
          prepend-icon="mdi-calendar-plus"
          title="Create Event"
          to="/events/create"
        />
      </VList>
    </VNavigationDrawer>

    <VAppBar
      app
      clipped-left
      color="primary"
      dark
    >
      <VAppBarNavIcon @click="drawer = !drawer" />
      <VToolbarTitle>Calendar App</VToolbarTitle>

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
const { data, status } = useAuth();
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
</script>
