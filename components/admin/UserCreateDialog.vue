<template>
  <VDialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>Create User</VCardTitle>

      <VCardText>
        <VForm
          ref="form"
          v-model="valid"
          @submit.prevent="createUser"
        >
          <VTextField
            v-model="formData.username"
            label="Username"
            :rules="usernameRules"
            class="mb-4"
          />

          <VTextField
            v-model="formData.displayName"
            label="Display Name"
            :rules="displayNameRules"
            class="mb-4"
          />

          <VTextField
            v-model="formData.password"
            label="Password"
            type="password"
            :rules="passwordRules"
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
          :loading="creating"
          :disabled="!valid"
          @click="createUser"
        >
          Create
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
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
  password: "",
  roles: ["user"] as string[],
});

const valid = ref(false);
const creating = ref(false);
const form = ref();

// Role options
const roleOptions = [
  { title: "User", value: "user" },
  { title: "Admin", value: "admin" },
];

// Validation rules
const usernameRules = [
  (v: string) => !!v || "Username is required",
  (v: string) => v.length >= 3 || "Username must be at least 3 characters",
  (v: string) => v.length <= 50 || "Username must be less than 50 characters",
  (v: string) => /^[a-zA-Z0-9_]+$/.test(v) || "Username can only contain letters, numbers, and underscores",
];

const displayNameRules = [
  (v: string) => !!v || "Display name is required",
  (v: string) => v.length <= 100 || "Display name must be less than 100 characters",
];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => v.length >= 6 || "Password must be at least 6 characters",
];

const rolesRules = [(v: string[]) => v.length > 0 || "At least one role is required"];

// Watch for dialog open/close to reset form
watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      // Reset form when dialog opens
      formData.value = {
        username: "",
        displayName: "",
        password: "",
        roles: ["user"],
      };
      if (form.value) {
        form.value.resetValidation();
      }
    }
  },
);

// Methods
const createUser = async () => {
  if (!valid.value) return;

  creating.value = true;
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        username: formData.value.username,
        displayName: formData.value.displayName,
        password: formData.value.password,
        roles: formData.value.roles,
      },
    });

    emit("saved");
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Failed to create user:", error);
    // Show error notification
  } finally {
    creating.value = false;
  }
};
</script>
