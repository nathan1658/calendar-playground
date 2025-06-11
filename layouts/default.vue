<template>
  <VApp>
    <VAppBar
      app
      color="white"
      elevation="1"
      height="64"
      border="b"
    >
      <!-- Left side - Logo and Title -->
      <div class="d-flex align-center ml-4">
        <VAvatar
          color="primary"
          size="32"
          class="mr-3"
        >
          <VIcon
            icon="mdi-view-dashboard"
            color="white"
            size="18"
          />
        </VAvatar>
        <span class="text-h6 font-weight-bold text-grey-darken-3">Dashboard</span>
      </div>

      <VSpacer />

      <!-- Center - Navigation Tabs -->
      <div class="d-flex align-center">
        <VTabs
          :model-value="activeTab"
          color="primary"
          class="mx-8"
        >
          <VTab
            value="overview"
            :active="$route.path === '/'"
            @click="navigateTo('/')"
          >
            Overview
          </VTab>
          <VTab
            value="analytics"
            :active="$route.path === '/analytics'"
            @click="navigateTo('/analytics')"
          >
            Analytics
          </VTab>
          <VTab
            value="calendar"
            :active="$route.path === '/calendar'"
            @click="navigateTo('/calendar')"
          >
            Calendar
          </VTab>
          <VTab
            value="settings"
            :active="$route.path === '/settings'"
            @click="navigateTo('/settings')"
          >
            Settings
          </VTab>
          <VTab
            v-if="isAdmin"
            value="admin"
            :active="$route.path.startsWith('/admin')"
            @click="navigateTo('/admin')"
          >
            Admin
          </VTab>
        </VTabs>
      </div>

      <VSpacer />

      <!-- Right side - Search and User Avatar -->
      <div class="d-flex align-center mr-4">
        <!-- User Avatar with Menu -->
        <VMenu v-if="currentUser">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              icon
              variant="text"
              size="small"
            >
              <VAvatar
                size="32"
                color="primary"
              >
                <span class="text-sm font-weight-bold">
                  {{ (currentUser.displayName || currentUser.username).charAt(0).toUpperCase() }}
                </span>
              </VAvatar>
            </VBtn>
          </template>
          <VList>
            <VListItem>
              <VListItemTitle>{{ currentUser.displayName || currentUser.username }}</VListItemTitle>
              <VListItemSubtitle>{{ isAdmin ? "Administrator" : "User" }}</VListItemSubtitle>
            </VListItem>
            <VDivider />
            <VListItem @click="handleCreateEvent">
              <template #prepend>
                <VIcon icon="mdi-plus" />
              </template>
              <VListItemTitle>Create Event</VListItemTitle>
            </VListItem>
            <VListItem to="/calendars">
              <template #prepend>
                <VIcon icon="mdi-calendar-multiple" />
              </template>
              <VListItemTitle>My Calendars</VListItemTitle>
            </VListItem>
            <VDivider v-if="isAdmin" />
            <VListItem
              v-if="isAdmin"
              to="/admin/users"
            >
              <template #prepend>
                <VIcon icon="mdi-account-multiple" />
              </template>
              <VListItemTitle>Manage Users</VListItemTitle>
            </VListItem>
            <VListItem
              v-if="isAdmin"
              to="/admin/calendars"
            >
              <template #prepend>
                <VIcon icon="mdi-calendar-multiple-check" />
              </template>
              <VListItemTitle>Manage Calendars</VListItemTitle>
            </VListItem>
            <VDivider />
            <VListItem @click="handleLogout">
              <template #prepend>
                <VIcon
                  icon="mdi-logout"
                  color="error"
                />
              </template>
              <VListItemTitle>Logout</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>

        <!-- Login button for unauthenticated users -->
        <VBtn
          v-else
          variant="outlined"
          color="primary"
          @click="navigateTo('/login')"
        >
          <template #prepend>
            <VIcon
              icon="mdi-login"
              size="18"
            />
          </template>
          Login
        </VBtn>
      </div>
    </VAppBar>

    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const { data, signOut } = useAuth();
const route = useRoute();

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

// Active tab based on current route
const activeTab = computed(() => {
  const path = route.path;
  if (path === "/") return "overview";
  if (path === "/analytics") return "analytics";
  if (path === "/calendar") return "calendar";
  if (path === "/settings") return "settings";
  if (path.startsWith("/admin")) return "admin";
  return "overview";
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
</script>

<style scoped>
/* App Bar Enhancements */
.v-app-bar {
  backdrop-filter: blur(20px);
  background-color: rgba(255, 255, 255, 0.95) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tab Hover Effects */
:deep(.v-tab) {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

:deep(.v-tab:hover) {
  color: rgb(var(--v-theme-primary));
  transform: translateY(-1px);
}

:deep(.v-tab--selected) {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

:deep(.v-tab::before) {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

:deep(.v-tab--selected::before) {
  width: 100%;
}

:deep(.v-tab:hover::before) {
  width: 100%;
  background: rgba(var(--v-theme-primary), 0.5);
}

:deep(.v-text-field:hover .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.v-text-field .v-field--focused) {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

/* Button Enhancements */
.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  font-weight: 500;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-btn:active {
  transform: translateY(0);
}

/* Avatar Enhancements */
.v-avatar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Badge Animation */
:deep(.v-badge .v-badge__badge) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Menu Enhancements */
:deep(.v-menu > .v-overlay__content) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.v-list-item) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  margin: 2px 8px;
}

:deep(.v-list-item:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(4px);
}

:deep(.v-list-item__prepend) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-list-item:hover .v-list-item__prepend) {
  transform: scale(1.1);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Accessibility improvements */
.v-btn:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* Glass morphism effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Subtle animations on page load */
.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Stagger animation for multiple elements */
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
</style>
