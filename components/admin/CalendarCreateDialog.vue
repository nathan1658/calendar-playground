<template>
  <VDialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>Create New Calendar</VCardTitle>

      <VCardText>
        <VForm
          ref="formRef"
          v-model="valid"
          @submit.prevent="handleSubmit"
        >
          <VTextField
            v-model="form.name"
            label="Calendar Name"
            :rules="nameRules"
            required
            variant="outlined"
            class="mb-3"
          />

          <VTextField
            v-model="form.category"
            label="Category (Optional)"
            :rules="categoryRules"
            variant="outlined"
            class="mb-3"
          />

          <VSelect
            v-model="form.ownerId"
            label="Owner (Optional)"
            :items="users"
            item-title="displayName"
            item-value="id"
            variant="outlined"
            clearable
            class="mb-3"
          >
            <template #item="{ props, item }">
              <VListItem v-bind="props">
                <VListItemTitle>
                  {{ item.raw.displayName || item.raw.username }}
                </VListItemTitle>
                <VListItemSubtitle>
                  {{ item.raw.username }}
                </VListItemSubtitle>
              </VListItem>
            </template>
          </VSelect>
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          text
          @click="handleCancel"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          :disabled="!valid"
          @click="handleSubmit"
        >
          Create
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

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "created"): void;
}

interface CreateCalendarPayload {
  name: string;
  category?: string;
  ownerId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const users = ref<User[]>([]);

const form = ref({
  name: "",
  category: "",
  ownerId: "",
});

const nameRules = [
  (v: string) => !!v || "Calendar name is required",
  (v: string) => v.length <= 100 || "Name must be less than 100 characters",
];

const categoryRules = [(v: string) => !v || v.length <= 50 || "Category must be less than 50 characters"];

const fetchUsers = async () => {
  try {
    const response = await $fetch<{ users: User[] }>("/api/users");
    users.value = response.users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
};

const handleSubmit = async () => {
  if (!valid.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const payload: CreateCalendarPayload = {
      name: form.value.name,
    };

    if (form.value.category) {
      payload.category = form.value.category;
    }

    if (form.value.ownerId) {
      payload.ownerId = form.value.ownerId;
    }

    await $fetch("/api/calendars", {
      method: "POST",
      body: payload,
    });

    emit("created");
    handleCancel();
  } catch (error: unknown) {
    if (error && typeof error === "object" && "data" in error) {
      errorMessage.value = (error as { data?: { message?: string } }).data?.message || "Failed to create calendar";
    } else {
      errorMessage.value = "Failed to create calendar";
    }
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  form.value = {
    name: "",
    category: "",
    ownerId: "",
  };
  errorMessage.value = "";
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
