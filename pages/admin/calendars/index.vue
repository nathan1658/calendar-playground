<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4 font-weight-bold">Calendar Management</h1>
          <VBreadcrumbs
            :items="breadcrumbs"
            divider="/"
          />
        </div>

        <AdminCalendarList />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
// Set page meta
definePageMeta({
  layout: "admin",
});

const breadcrumbs = [
  {
    title: "Admin",
    disabled: false,
    href: "/admin",
  },
  {
    title: "Calendars",
    disabled: true,
    href: "/admin/calendars",
  },
];

// Set page head
useHead({
  title: "Calendar Management - Admin",
});
</script>
