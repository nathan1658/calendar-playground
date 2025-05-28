<template>
  <VApp>
    <VNavigationDrawer
      v-model="drawer"
      app
      clipped
    >
      <VList>
        <VListItem
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/admin"
        />
        <VListItem
          prepend-icon="mdi-calendar-multiple"
          title="Calendars"
          to="/admin/calendars"
        />
        <VListItem
          prepend-icon="mdi-account-multiple"
          title="Users"
          to="/admin/users"
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
      <VToolbarTitle>Calendar Admin</VToolbarTitle>
      <VSpacer />
      <VBtn
        icon="mdi-logout"
        @click="handleLogout"
      />
    </VAppBar>

    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const { signOut } = useAuth();
const drawer = ref(true);
definePageMeta({
  middleware: "admin",
});

const handleLogout = async () => {
  await signOut();
  await navigateTo("/login");
};
</script>
