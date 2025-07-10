<template>
  <div>
    <AdminCalendarList />
  </div>
</template>

<script setup lang="ts">
// Set page meta - removed admin layout, will use default
definePageMeta({
  rolesAllowed: ["admin"],
  middleware: ["roles-permission-check"],
});

// Set page head
useHead({
  title: "Calendar Management - Admin",
});
</script>

<style scoped>
.page-header {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
  padding-bottom: 1rem;
}
</style>
