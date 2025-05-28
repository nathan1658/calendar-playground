<template>
  <VMenu
    v-model="showMenu"
    :close-on-content-click="false"
    location="bottom end"
    offset="8"
    transition="scale-transition"
    origin="top right"
    min-width="320"
  >
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        icon
        size="large"
        variant="text"
        class="user-avatar-button"
      >
        <VAvatar
          :size="40"
          :color="avatarColor"
        >
          <VImg
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user.displayName || user.username"
          />
          <span
            v-else
            class="text-h6 font-weight-medium text-white"
          >
            {{ userInitials }}
          </span>
        </VAvatar>
      </VBtn>
    </template>

    <VCard
      class="user-info-card"
      elevation="8"
    >
      <!-- User Info Header -->
      <VCardText class="pa-0">
        <div class="user-header">
          <div class="d-flex align-center pa-4 pb-2">
            <VAvatar
              :size="56"
              :color="avatarColor"
              class="mr-3"
            >
              <VImg
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user.displayName || user.username"
              />
              <span
                v-else
                class="text-h5 font-weight-medium text-white"
              >
                {{ userInitials }}
              </span>
            </VAvatar>

            <div class="flex-grow-1">
              <div class="text-h6 font-weight-medium text-high-emphasis">
                {{ displayName }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ username }}
              </div>
              <VChip
                :color="isAdmin ? 'warning' : 'primary'"
                variant="flat"
                size="x-small"
                class="mt-1"
              >
                <VIcon
                  :icon="isAdmin ? 'mdi-shield-crown' : 'mdi-account'"
                  size="12"
                  class="mr-1"
                />
                {{ isAdmin ? "Administrator" : "User" }}
              </VChip>
            </div>
          </div>
        </div>

        <VDivider class="mx-4" />

        <!-- Account Actions -->
        <VList
          density="compact"
          class="pa-2"
        >
          <VListItem
            prepend-icon="mdi-account-circle"
            title="Profile & Account"
            subtitle="Manage your profile information"
            @click="handleProfileClick"
          />

          <VListItem
            prepend-icon="mdi-cog"
            title="Settings"
            subtitle="App preferences and settings"
            @click="handleSettingsClick"
          />

          <VListItem
            v-if="isAdmin"
            prepend-icon="mdi-shield-crown"
            title="Admin Dashboard"
            subtitle="System administration"
            @click="handleAdminClick"
          />

          <VDivider class="my-2" />

          <VListItem
            prepend-icon="mdi-theme-light-dark"
            title="Theme"
            subtitle="Toggle dark/light mode"
            @click="toggleTheme"
          >
            <template #append>
              <VIcon
                :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
                size="20"
                class="text-medium-emphasis"
              />
            </template>
          </VListItem>

          <VDivider class="my-2" />

          <VListItem
            prepend-icon="mdi-logout"
            title="Sign out"
            subtitle="Sign out of your account"
            class="text-error"
            @click="handleLogout"
          />
        </VList>
      </VCardText>
    </VCard>
  </VMenu>
</template>

<script setup lang="ts">
interface User {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  roles: string[];
}

interface Props {
  user?: User | null;
}

const props = defineProps<Props>();

// Auth composable
const { signOut } = useAuth();
const colorMode = useColorMode();

// Reactive state
const showMenu = ref(false);

// Watch for user changes and close menu if user becomes null
watchEffect(() => {
  if (!props.user) {
    showMenu.value = false;
  }
});

// Computed properties - all reactive to props.user changes
const isAdmin = computed(() => {
  return props.user?.roles?.includes("admin") || false;
});

const isDark = computed(() => colorMode.value === "dark");

const userInitials = computed(() => {
  if (!props.user) return "?";

  const displayName = props.user.displayName || props.user.username;
  if (!displayName) return "?";

  const words = displayName.trim().split(" ");

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return displayName.substring(0, 2).toUpperCase();
});

const avatarColor = computed(() => {
  if (!props.user?.username) return "grey";

  const colors = ["blue", "green", "purple", "orange", "teal", "pink", "indigo", "cyan", "amber", "red"];

  const username = props.user.username;
  const index = username.length % colors.length;
  return colors[index];
});

const displayName = computed(() => {
  return props.user?.displayName || props.user?.username || "Unknown User";
});

const username = computed(() => {
  return props.user?.username || "";
});

// Methods
const handleProfileClick = () => {
  showMenu.value = false;
  navigateTo("/profile");
};

const handleSettingsClick = () => {
  showMenu.value = false;
  navigateTo("/settings");
};

const handleAdminClick = () => {
  showMenu.value = false;
  navigateTo("/admin");
};

const handleLogout = async () => {
  showMenu.value = false;
  try {
    await signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const toggleTheme = () => {
  if (colorMode.value === "dark") {
    colorMode.value = "light";
  } else {
    colorMode.value = "dark";
  }
};
</script>

<style scoped>
.user-avatar-button {
  border-radius: 50%;
  transition: all 0.2s ease-in-out;
}

.user-avatar-button:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}

.user-info-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.user-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  border-radius: 12px 12px 0 0;
  position: relative;
}

.user-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px 12px 0 0;
}

.user-header > div {
  position: relative;
  z-index: 1;
}

.user-header .text-high-emphasis {
  color: white !important;
}

.user-header .text-medium-emphasis {
  color: rgba(255, 255, 255, 0.8) !important;
}

.v-list-item {
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.2s ease-in-out;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}

.v-list-item.text-error:hover {
  background-color: rgba(var(--v-theme-error), 0.08);
}

.v-list-item .v-list-item__prepend .v-icon {
  opacity: 0.7;
}

.v-list-item:hover .v-list-item__prepend .v-icon {
  opacity: 1;
}
</style>
