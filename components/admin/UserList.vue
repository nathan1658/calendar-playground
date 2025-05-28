<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Users</span>
      <VBtn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
      >
        Add User
      </VBtn>
    </VCardTitle>

    <VCardText>
      <VDataTable
        :headers="headers"
        :items="users"
        :loading="loading"
        item-key="id"
        class="elevation-1"
      >
        <template #item.roles="{ item }">
          <VChip
            v-for="role in item.roles"
            :key="role"
            :color="role === 'admin' ? 'primary' : 'default'"
            size="small"
            class="me-1"
          >
            {{ role }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="openEditDialog(item)"
          />
          <VBtn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="confirmDelete(item)"
          />
        </template>
      </VDataTable>
    </VCardText>

    <!-- Edit User Dialog -->
    <AdminUserEditDialog
      v-model="editDialog"
      :user="selectedUser"
      @saved="handleUserSaved"
    />

    <!-- Create User Dialog -->
    <AdminUserCreateDialog
      v-model="createDialog"
      @saved="handleUserSaved"
    />

    <!-- Delete Confirmation Dialog -->
    <VDialog
      v-model="deleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle>Confirm Deletion</VCardTitle>
        <VCardText>
          Are you sure you want to delete user "{{ selectedUser?.username }}"? This action cannot be undone.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            text
            @click="deleteDialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            text
            :loading="deleting"
            @click="deleteUser"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup lang="ts">
interface User {
  id: string;
  username: string;
  displayName?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

// Reactive data
const users = ref<User[]>([]);
const loading = ref(false);
const editDialog = ref(false);
const createDialog = ref(false);
const deleteDialog = ref(false);
const selectedUser = ref<User | null>(null);
const deleting = ref(false);

// Table headers
const headers = [
  { title: "Username", key: "username", sortable: true },
  { title: "Display Name", key: "displayName", sortable: true },
  { title: "Roles", key: "roles", sortable: false },
  { title: "Created", key: "createdAt", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: 120 },
];

// Methods
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await $fetch<{ users: User[] }>("/api/users");
    users.value = response.users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    // Show error notification
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  createDialog.value = true;
};

const openEditDialog = (user: User) => {
  selectedUser.value = user;
  editDialog.value = true;
};

const confirmDelete = (user: User) => {
  selectedUser.value = user;
  deleteDialog.value = true;
};

const deleteUser = async () => {
  if (!selectedUser.value) return;

  deleting.value = true;
  try {
    await $fetch(`/api/users/${selectedUser.value.id}`, {
      method: "DELETE",
    });

    // Remove from local list
    users.value = users.value.filter(u => u.id !== selectedUser.value!.id);

    deleteDialog.value = false;
    selectedUser.value = null;

    // Show success notification
  } catch (error) {
    console.error("Failed to delete user:", error);
    // Show error notification
  } finally {
    deleting.value = false;
  }
};

const handleUserSaved = () => {
  // Refresh the users list
  fetchUsers();
  editDialog.value = false;
  createDialog.value = false;
  selectedUser.value = null;
};

// Initialize
onMounted(() => {
  fetchUsers();
});
</script>
