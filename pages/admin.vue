<template>
  <div class="admin-layout">
    <!-- Left Sidebar Navigation -->
    <VNavigationDrawer
      permanent
      width="280"
      class="admin-sidebar"
    >
      <VList class="pa-2">
        <VListItem
          title="Calendar Management"
          :active="$route.path.startsWith('/admin/calendars')"
          class="mb-1"
          @click="navigateTo('/admin/calendars')"
        />

        <VListItem
          title="User Management"
          :active="$route.path.startsWith('/admin/users')"
          class="mb-1"
          @click="navigateTo('/admin/users')"
        />
      </VList>
    </VNavigationDrawer>

    <!-- Main Content Area -->
    <div
      class="admin-main pa-6 mx-auto"
      style="max-width: 1200px"
    >
      <!-- Child route content will be rendered here -->
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page meta - removed admin layout, will use default
definePageMeta({
  middleware: "admin",
});

onMounted(() => {
  navigateTo("/admin/calendars");
});

// Set page head
useHead({
  title: "Admin Dashboard",
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  border-right: 1px solid rgb(var(--v-theme-surface-variant)) !important;
}

.sidebar-header {
  background: rgb(var(--v-theme-surface-variant));
}

.admin-main {
  flex: 1;
}

.welcome-section {
  margin-bottom: 2rem;
}

.admin-feature-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgb(var(--v-theme-surface-variant));
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 4px;
}
</style>
