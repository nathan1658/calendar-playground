<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4 font-weight-bold">User Management</h1>
          <VBreadcrumbs
            :items="breadcrumbs"
            divider="/"
          />
        </div>

        <AdminUserList />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
// Set page meta - removed admin layout, will use default
definePageMeta({
  middleware: "admin",
});

const breadcrumbs = [
  {
    title: "Admin",
    disabled: false,
    href: "/admin",
  },
  {
    title: "Users",
    disabled: true,
    href: "/admin/users",
  },
];

// Set page head
useHead({
  title: "User Management - Admin",
});
</script>
