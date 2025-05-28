<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon
              icon="mdi-view-dashboard"
              class="mr-2"
            />
            {{ isAdmin ? "Admin Dashboard" : "Dashboard" }}
          </VCardTitle>
          <VCardText>
            <div v-if="status === 'loading'">
              <VProgressCircular indeterminate />
              <span class="ml-2">Loading user information...</span>
            </div>
            <div v-else-if="currentUser">
              <VAlert
                :type="isAdmin ? 'info' : 'success'"
                variant="tonal"
                class="mb-4"
              >
                <template #prepend>
                  <VIcon :icon="isAdmin ? 'mdi-shield-account' : 'mdi-account-circle'" />
                </template>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="font-weight-bold">Welcome, {{ currentUser.displayName || currentUser.username }}!</div>
                    <div class="text-caption">{{ isAdmin ? "Administrator Access" : "Standard User Access" }}</div>
                  </div>
                  <VChip
                    :color="isAdmin ? 'warning' : 'primary'"
                    variant="flat"
                    size="small"
                  >
                    {{ currentUser.roles.join(", ") }}
                  </VChip>
                </div>
              </VAlert>

              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VCard variant="outlined">
                    <VCardTitle class="text-h6">User Information</VCardTitle>
                    <VCardText>
                      <div class="mb-2">
                        <strong>Username:</strong>
                        {{ currentUser.username }}
                      </div>
                      <div class="mb-2">
                        <strong>Display Name:</strong>
                        {{ currentUser.displayName || "Not set" }}
                      </div>
                      <div class="mb-2">
                        <strong>Access Level:</strong>
                        {{ isAdmin ? "Administrator" : "Standard User" }}
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VCard variant="outlined">
                    <VCardTitle class="text-h6">Quick Actions</VCardTitle>
                    <VCardText>
                      <div class="d-flex flex-column ga-2">
                        <VBtn
                          color="primary"
                          variant="outlined"
                          prepend-icon="mdi-calendar-multiple"
                          block
                          @click="navigateTo('/calendars')"
                        >
                          My Calendars
                        </VBtn>

                        <VBtn
                          color="secondary"
                          variant="outlined"
                          prepend-icon="mdi-calendar"
                          block
                          @click="navigateTo('/calendar')"
                        >
                          Calendar View
                        </VBtn>

                        <VBtn
                          color="success"
                          variant="outlined"
                          prepend-icon="mdi-calendar-plus"
                          block
                          @click="navigateTo('/events/create')"
                        >
                          Create Event
                        </VBtn>

                        <VBtn
                          color="info"
                          variant="outlined"
                          prepend-icon="mdi-view-dashboard"
                          block
                          :disabled="!isAdmin"
                          @click="isAdmin ? navigateTo('/admin') : undefined"
                        >
                          <span :class="{ 'text-disabled': !isAdmin }">Admin Dashboard</span>
                          <VTooltip
                            v-if="!isAdmin"
                            activator="parent"
                            location="bottom"
                          >
                            Administrator access required
                          </VTooltip>
                        </VBtn>

                        <VBtn
                          color="warning"
                          variant="outlined"
                          prepend-icon="mdi-calendar-multiple"
                          block
                          :disabled="!isAdmin"
                          @click="isAdmin ? navigateTo('/admin/calendars') : undefined"
                        >
                          <span :class="{ 'text-disabled': !isAdmin }">Manage Calendars</span>
                          <VTooltip
                            v-if="!isAdmin"
                            activator="parent"
                            location="bottom"
                          >
                            Administrator access required
                          </VTooltip>
                        </VBtn>

                        <VBtn
                          color="orange"
                          variant="outlined"
                          prepend-icon="mdi-account-multiple"
                          block
                          :disabled="!isAdmin"
                          @click="isAdmin ? navigateTo('/admin/users') : undefined"
                        >
                          <span :class="{ 'text-disabled': !isAdmin }">Manage Users</span>
                          <VTooltip
                            v-if="!isAdmin"
                            activator="parent"
                            location="bottom"
                          >
                            Administrator access required
                          </VTooltip>
                        </VBtn>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </div>
            <div v-else>
              <VAlert
                type="warning"
                variant="tonal"
              >
                <template #prepend>
                  <VIcon icon="mdi-alert-circle" />
                </template>
                No user information available. Please log in to continue.
              </VAlert>
            </div>
          </VCardText>
          <VCardActions
            v-if="currentUser"
            class="justify-end"
          >
            <VBtn
              color="error"
              variant="outlined"
              prepend-icon="mdi-logout"
              :loading="isLoggingOut"
              @click="handleLogout"
            >
              Logout
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
const { status, data, signOut } = useAuth();
const isLoggingOut = ref(false);

// Make user data properly reactive
const currentUser = computed(() => {
  const sessionData = data.value as unknown as {
    user: {
      username: string;
      displayName?: string;
      roles: string[];
    };
  } | null;
  return sessionData?.user || null;
});

const isAdmin = computed(() => {
  return currentUser.value?.roles?.includes("admin") || false;
});

const handleLogout = async () => {
  try {
    isLoggingOut.value = true;
    await signOut();
    await navigateTo("/login");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<style scoped>
.text-disabled {
  opacity: 0.6;
}
</style>
