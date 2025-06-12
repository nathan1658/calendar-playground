<template>
  <div>
    <AdminUserList />
  </div>
</template>

<script setup lang="ts">
// Set page meta - removed admin layout, will use default
definePageMeta({
  middleware: "admin",
});

// Set page head
useHead({
  title: "User Management - Admin",
});
</script>

<style scoped>
.page-header {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
  padding-bottom: 1rem;
}
</style>
