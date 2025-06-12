<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>Manage Permissions - {{ calendar?.name }}</VCardTitle>

      <VCardText>
        <!-- Add Permission Section -->
        <VCard
          class="mb-4"
          variant="outlined"
        >
          <VCardTitle class="text-h6">Add Permission</VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="newPermission.userId"
                  label="Select User"
                  :items="availableUsers"
                  item-title="displayName"
                  item-value="id"
                  variant="outlined"
                >
                  <template #item="{ props, item }">
                    <VListItem
                      v-if="item?.raw"
                      v-bind="props"
                    >
                      <VListItemTitle>
                        {{ item.raw.displayName || item.raw.username || "Unknown User" }}
                      </VListItemTitle>
                      <VListItemSubtitle>
                        {{ item.raw.username || "No username" }}
                      </VListItemSubtitle>
                    </VListItem>
                  </template>
                </VSelect>
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VSelect
                  v-model="newPermission.accessLevel"
                  label="Access Level"
                  :items="accessLevels"
                  variant="outlined"
                />
              </VCol>
              <VCol
                cols="12"
                md="2"
                class="d-flex align-center"
              >
                <VBtn
                  color="primary"
                  :disabled="!newPermission.userId || !newPermission.accessLevel"
                  :loading="addingPermission"
                  @click="addPermission"
                >
                  Add
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Current Permissions Section -->
        <VCard variant="outlined">
          <VCardTitle class="text-h6">Current Permissions</VCardTitle>
          <VCardText>
            <VDataTable
              :headers="permissionHeaders"
              :items="calendar?.permissions || []"
              :loading="loading"
              item-value="userId"
              class="elevation-1"
            >
              <template #item.user="{ item }">
                <div>
                  <div class="font-weight-medium">
                    {{ item.user.displayName || item.user.username }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ item.user.username }}
                  </div>
                </div>
              </template>

              <template #item.accessLevel="{ item }">
                <VChip
                  :color="item.accessLevel === 'edit' ? 'success' : 'info'"
                  size="small"
                  variant="outlined"
                >
                  {{ item.accessLevel }}
                </VChip>
              </template>

              <template #item.actions="{ item }">
                <VBtn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  :loading="removingPermission === item.userId"
                  @click="removePermission(item.userId)"
                />
              </template>

              <template #no-data>
                <div class="text-center pa-4">No permissions assigned yet</div>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          text
          @click="handleClose"
        >
          Close
        </VBtn>
      </VCardActions>

      <VAlert
        v-if="errorMessage"
        type="error"
        class="ma-4"
      >
        {{ errorMessage }}
      </VAlert>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
interface User {
  id: string;
  username: string;
  displayName?: string;
}

interface Permission {
  userId: string;
  accessLevel: "view" | "edit";
  user: User;
}

interface Calendar {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Props {
  modelValue: boolean;
  calendar: Calendar | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "updated"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const addingPermission = ref(false);
const removingPermission = ref<string | null>(null);
const errorMessage = ref("");
const users = ref<User[]>([]);

const newPermission = ref({
  userId: "",
  accessLevel: "",
});

const accessLevels = [
  { title: "View", value: "view" },
  { title: "Edit", value: "edit" },
];

const permissionHeaders = [
  { title: "User", key: "user", sortable: false },
  { title: "Access Level", key: "accessLevel", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
];

const availableUsers = computed(() => {
  if (!props.calendar) return users.value;

  const assignedUserIds = props.calendar.permissions.map(p => p.userId);
  return users.value.filter(user => !assignedUserIds.includes(user.id));
});

const fetchUsers = async () => {
  try {
    const response = await $fetch<{ users: User[] }>("/api/users");
    users.value = response.users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
};

const addPermission = async () => {
  if (!props.calendar || !newPermission.value.userId || !newPermission.value.accessLevel) return;

  addingPermission.value = true;
  errorMessage.value = "";

  try {
    await $fetch(`/api/calendars/${props.calendar.id}/permissions`, {
      method: "POST",
      body: {
        userId: newPermission.value.userId,
        accessLevel: newPermission.value.accessLevel,
      },
    });

    newPermission.value = {
      userId: "",
      accessLevel: "",
    };

    emit("updated");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "data" in error) {
      errorMessage.value = (error as { data?: { message?: string } }).data?.message || "Failed to add permission";
    } else {
      errorMessage.value = "Failed to add permission";
    }
  } finally {
    addingPermission.value = false;
  }
};

const removePermission = async (userId: string) => {
  if (!props.calendar) return;

  removingPermission.value = userId;
  errorMessage.value = "";

  try {
    await $fetch(`/api/calendars/${props.calendar.id}/permissions/${userId}`, {
      method: "DELETE",
    });

    emit("updated");
  } catch (error: unknown) {
    if (error && typeof error === "object" && "data" in error) {
      errorMessage.value = (error as { data?: { message?: string } }).data?.message || "Failed to remove permission";
    } else {
      errorMessage.value = "Failed to remove permission";
    }
  } finally {
    removingPermission.value = null;
  }
};

const handleClose = () => {
  errorMessage.value = "";
  newPermission.value = {
    userId: "",
    accessLevel: "",
  };
  emit("update:modelValue", false);
};

// Fetch users when dialog opens
watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      fetchUsers();
    }
  },
);
</script>
