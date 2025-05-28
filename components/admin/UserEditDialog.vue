<template>
  <VDialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>Edit User</VCardTitle>

      <VCardText>
        <VForm
          ref="form"
          v-model="valid"
          @submit.prevent="saveUser"
        >
          <VTextField
            v-model="formData.username"
            label="Username"
            readonly
            disabled
            class="mb-4"
          />

          <VTextField
            v-model="formData.displayName"
            label="Display Name"
            :rules="displayNameRules"
            class="mb-4"
          />

          <VSelect
            v-model="formData.roles"
            label="Roles"
            :items="roleOptions"
            multiple
            chips
            :rules="rolesRules"
            class="mb-4"
          />
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          text
          @click="$emit('update:modelValue', false)"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          :loading="saving"
          :disabled="!valid"
          @click="saveUser"
        >
          Save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
interface User {
  id: string;
  username: string;
  displayName?: string;
  roles: string[];
}

interface Props {
  modelValue: boolean;
  user: User | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "saved"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Form data
const formData = ref({
  username: "",
  displayName: "",
  roles: [] as string[],
});

const valid = ref(false);
const saving = ref(false);
const form = ref();

// Role options
const roleOptions = [
  { title: "User", value: "user" },
  { title: "Admin", value: "admin" },
];

// Validation rules
const displayNameRules = [
  (v: string) => !!v || "Display name is required",
  (v: string) => v.length <= 100 || "Display name must be less than 100 characters",
];

const rolesRules = [(v: string[]) => v.length > 0 || "At least one role is required"];

// Watch for user changes
watch(
  () => props.user,
  newUser => {
    if (newUser) {
      formData.value = {
        username: newUser.username,
        displayName: newUser.displayName || "",
        roles: [...newUser.roles],
      };
    }
  },
  { immediate: true },
);

// Methods
const saveUser = async () => {
  if (!props.user || !valid.value) return;

  saving.value = true;
  try {
    await $fetch(`/api/users/${props.user.id}`, {
      method: "PUT",
      body: {
        displayName: formData.value.displayName,
        roles: formData.value.roles,
      },
    });

    emit("saved");
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Failed to update user:", error);
    // Show error notification
  } finally {
    saving.value = false;
  }
};
</script>
