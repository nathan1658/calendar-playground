<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Welcome to Calendar App</VCardTitle>
          <VCardText>
            <div v-if="status === 'loading'">
              <VProgressCircular indeterminate />
              <span class="ml-2">Loading user information...</span>
            </div>
            <div v-else-if="sessionData?.user">
              <p>
                <strong>Username:</strong>
                {{ sessionData.user.username }}
              </p>
              <p>
                <strong>Display Name:</strong>
                {{ sessionData.user.displayName || "Not set" }}
              </p>
              <p>
                <strong>Roles:</strong>
                {{ sessionData.user.roles.join(", ") }}
              </p>
              <p>
                <strong>Admin:</strong>
                {{ sessionData.user.roles.includes("admin") ? "Yes" : "No" }}
              </p>
            </div>
            <div v-else>
              <p>No user information available.</p>
            </div>
          </VCardText>
          <VCardActions v-if="sessionData?.user">
            <VBtn
              color="primary"
              @click="navigateTo('/admin')"
            >
              Admin
            </VBtn>
            <VBtn
              color="error"
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

// Type assertion for session data
const sessionData = data as unknown as { user: { username: string; displayName?: string; roles: string[] } } | null;

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

<style scoped></style>
