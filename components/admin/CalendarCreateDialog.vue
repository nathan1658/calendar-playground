<template>
  <BaseDialog
    v-model="isOpen"
    title="Create New Calendar"
    subtitle="Set up a new calendar for your team"
    icon="mdi-calendar-plus"
    icon-color="primary"
    max-width="600"
    persistent
    :loading="loading"
    :actions="dialogActions"
  >
    <VForm
      ref="formRef"
      v-model="valid"
      class="calendar-form"
      @submit.prevent="handleSubmit"
    >
      <!-- Calendar Name Field -->
      <div class="form-section">
        <VTextField
          v-model="form.name"
          :rules="nameRules"
          label="Calendar Name"
          placeholder="Enter a descriptive name for your calendar"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          required
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-calendar"
              size="18"
              color="primary"
            />
          </template>
        </VTextField>
      </div>

      <!-- Category Field -->
      <div class="form-section">
        <VTextField
          v-model="form.category"
          :rules="categoryRules"
          label="Category (Optional)"
          placeholder="e.g., Work, Personal, Projects"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-tag"
              size="18"
              color="primary"
            />
          </template>
        </VTextField>
      </div>

      <!-- Owner Selection Field -->
      <div class="form-section">
        <VSelect
          v-model="form.ownerId"
          :items="users"
          item-title="displayName"
          item-value="id"
          label="Calendar Owner (Optional)"
          placeholder="Select a calendar owner (defaults to you)"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details="auto"
          class="enhanced-field"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-account"
              size="18"
              color="primary"
            />
          </template>
          <template #item="{ props, item }">
            <VListItem
              v-bind="props"
              class="user-list-item"
            >
              <template #prepend>
                <VAvatar
                  size="32"
                  color="primary"
                  class="mr-3"
                >
                  <span class="text-caption font-weight-bold">
                    {{ (item.raw.displayName || item.raw.username).charAt(0).toUpperCase() }}
                  </span>
                </VAvatar>
              </template>
              <VListItemTitle class="font-weight-medium">
                {{ item.raw.displayName || item.raw.username }}
              </VListItemTitle>
              <VListItemSubtitle class="text-caption">
                {{ item.raw.username }}
              </VListItemSubtitle>
            </VListItem>
          </template>
          <template #selection="{ item }">
            <div class="d-flex align-center">
              <VAvatar
                size="20"
                color="primary"
                class="mr-2"
              >
                <span class="user-avatar-text">
                  {{ (item.raw.displayName || item.raw.username).charAt(0).toUpperCase() }}
                </span>
              </VAvatar>
              <span>{{ item.raw.displayName || item.raw.username }}</span>
            </div>
          </template>
        </VSelect>
      </div>

      <!-- Public Access Toggle -->
      <div class="form-section">
        <div class="public-access-card">
          <div class="d-flex align-start">
            <VCheckbox
              v-model="form.isPublic"
              color="primary"
              hide-details
              density="compact"
              class="public-checkbox"
            />
            <div class="flex-grow-1 ml-2">
              <div
                class="public-access-title"
                @click="form.isPublic = !form.isPublic"
              >
                Public Calendar Access
              </div>
              <p class="public-access-description">
                Allow unauthenticated users to view this calendar and its events. Perfect for public schedules and
                shared resources.
              </p>
              <VAlert
                v-if="form.isPublic"
                type="info"
                variant="tonal"
                density="compact"
                class="public-alert"
              >
                <template #prepend>
                  <VIcon
                    icon="mdi-earth"
                    size="16"
                  />
                </template>
                <span class="text-caption">This calendar will be publicly viewable</span>
              </VAlert>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Text -->
      <div class="help-section">
        <VIcon
          icon="mdi-information-outline"
          size="16"
          color="grey"
          class="mr-2"
        />
        <span class="help-text">Calendar permissions can be configured after creation</span>
      </div>
    </VForm>

    <!-- Error Display -->
    <VAlert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="error-alert"
    >
      <template #prepend>
        <VIcon icon="mdi-alert-circle" />
      </template>
      <div class="font-weight-medium">Failed to create calendar</div>
      <div class="text-body-2 mt-1">{{ errorMessage }}</div>
    </VAlert>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from "~/components/base/BaseDialog.vue";

interface User {
  id: string;
  username: string;
  displayName?: string;
}

interface Emits {
  (e: "created"): void;
}

interface CreateCalendarPayload {
  name: string;
  category?: string;
  ownerId?: string;
  isPublic?: boolean;
}

const emit = defineEmits<Emits>();

// Use defineModel for v-model binding
const isOpen = defineModel<boolean>({ default: false });

const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const users = ref<User[]>([]);

const form = ref({
  name: "",
  category: "",
  ownerId: "",
  isPublic: false,
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

    if (form.value.isPublic) {
      payload.isPublic = form.value.isPublic;
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
    isPublic: false,
  };
  errorMessage.value = "";
  isOpen.value = false;
};

// Dialog actions
const dialogActions = computed(() => [
  {
    text: "Cancel",
    variant: "text" as const,
    color: "grey",
    disabled: loading.value,
    onClick: handleCancel,
  },
  {
    text: "Create Calendar",
    variant: "elevated" as const,
    color: "primary",
    loading: loading.value,
    disabled: !valid.value || !form.value.name.trim(),
    onClick: handleSubmit,
  },
]);

// Fetch users when dialog opens
watch(isOpen, newValue => {
  if (newValue) {
    fetchUsers();
  }
});
</script>

<style scoped>
.calendar-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-section {
  margin-bottom: 24px;
}

.enhanced-field {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.enhanced-field:hover {
  transform: translateY(-1px);
}

:deep(.enhanced-field .v-field) {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.enhanced-field:hover .v-field) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.enhanced-field .v-field--focused) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3);
  border-color: rgb(var(--v-theme-primary));
}

.public-access-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.04));
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.public-access-card:hover {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-primary), 0.06));
  border-color: rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.2);
}

.public-checkbox {
  margin-top: -8px;
}

.public-access-title {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: color 0.2s ease;
  margin-bottom: 8px;
}

.public-access-title:hover {
  color: rgb(var(--v-theme-primary));
}

.public-access-description {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.public-alert {
  border-radius: 12px;
  margin-top: 12px;
}

.user-list-item {
  border-radius: 12px;
  margin: 2px 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(4px);
}

.user-avatar-text {
  font-size: 10px;
  font-weight: bold;
}

.help-section {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.help-text {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.error-alert {
  border-radius: 12px;
  margin-top: 16px;
}

/* Animation enhancements */
.form-section {
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: backwards;
}

.form-section:nth-child(1) {
  animation-delay: 0.1s;
}
.form-section:nth-child(2) {
  animation-delay: 0.2s;
}
.form-section:nth-child(3) {
  animation-delay: 0.3s;
}
.form-section:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-section {
    margin-bottom: 20px;
  }

  .public-access-card {
    padding: 16px;
  }

  .help-section {
    padding: 12px 16px;
  }
}

/* Focus and accessibility improvements */
:deep(.v-field__input) {
  transition: all 0.2s ease;
}

:deep(.v-checkbox .v-selection-control__wrapper) {
  transition: all 0.2s ease;
}

:deep(.v-checkbox:hover .v-selection-control__wrapper) {
  transform: scale(1.1);
}

/* Loading state */
.calendar-form[data-loading="true"] {
  opacity: 0.7;
  pointer-events: none;
}
</style>
