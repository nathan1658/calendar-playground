<template>
  <VDialog
    :model-value="modelValue"
    max-width="560"
    persistent
    class="modal-backdrop"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard class="modal-content">
      <!-- Enhanced Header -->
      <VCardTitle class="d-flex justify-space-between align-center pa-6 bg-grey-lighten-5 border-b">
        <div class="d-flex align-center">
          <VAvatar
            color="primary"
            size="40"
            class="mr-3"
          >
            <VIcon 
              icon="mdi-calendar-plus"
              color="white"
              size="20"
            />
          </VAvatar>
          <div>
            <h2 class="text-h6 font-weight-bold text-grey-darken-4">Create New Calendar</h2>
            <p class="text-body-2 text-grey-darken-1 ma-0">Set up a new calendar for your team</p>
          </div>
        </div>
        <VBtn
          icon
          variant="text"
          size="small"
          color="grey"
          @click="handleCancel"
        >
          <VIcon icon="mdi-close" size="20" />
        </VBtn>
      </VCardTitle>

      <!-- Enhanced Form Content -->
      <VCardText class="pa-6">
        <VForm
          ref="formRef"
          v-model="valid"
          @submit.prevent="handleSubmit"
        >
          <div>
            <!-- Calendar Name Field -->
            <div class="mb-6">
              <VTextField
                v-model="form.name"
                :rules="nameRules"
                label="Calendar Name"
                placeholder="Enter a descriptive name for your calendar"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                required
              >
                <template #prepend-inner>
                  <VIcon 
                    icon="mdi-calendar"
                    size="18"
                    color="grey"
                  />
                </template>
              </VTextField>
            </div>

            <!-- Category Field -->
            <div class="mb-6">
              <VTextField
                v-model="form.category"
                :rules="categoryRules"
                label="Category (Optional)"
                placeholder="e.g., Work, Personal, Projects"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              >
                <template #prepend-inner>
                  <VIcon 
                    icon="mdi-tag"
                    size="18"
                    color="grey"
                  />
                </template>
              </VTextField>
            </div>

            <!-- Owner Selection Field -->
            <div class="mb-6">
              <VSelect
                v-model="form.ownerId"
                :items="users"
                item-title="displayName"
                item-value="id"
                label="Calendar Owner (Optional - defaults to you)"
                placeholder="Select a calendar owner"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details="auto"
              >
                <template #prepend-inner>
                  <VIcon 
                    icon="mdi-account"
                    size="18"
                    color="grey"
                  />
                </template>
                <template #item="{ props, item }">
                  <VListItem v-bind="props">
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
                    <VListItemSubtitle>
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
                      <span style="font-size: 10px;">
                        {{ (item.raw.displayName || item.raw.username).charAt(0).toUpperCase() }}
                      </span>
                    </VAvatar>
                    <span>{{ item.raw.displayName || item.raw.username }}</span>
                  </div>
                </template>
              </VSelect>
            </div>

            <!-- Public Access Toggle -->
            <VCard variant="outlined" class="pa-4 bg-grey-lighten-5">
              <div class="d-flex align-start">
                <VCheckbox
                  v-model="form.isPublic"
                  color="primary"
                  hide-details
                  density="compact"
                />
                <div class="flex-grow-1 ml-2">
                  <div class="text-subtitle-2 font-weight-medium text-grey-darken-3 cursor-pointer" @click="form.isPublic = !form.isPublic">
                    Public Calendar Access
                  </div>
                  <p class="text-caption text-grey-darken-1 mb-2">
                    Allow unauthenticated users to view this calendar and its events. 
                    Perfect for public schedules and shared resources.
                  </p>
                  <VAlert
                    v-if="form.isPublic"
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mt-2"
                  >
                    <template #prepend>
                      <VIcon icon="mdi-earth" size="16" />
                    </template>
                    <span class="text-caption">This calendar will be publicly viewable</span>
                  </VAlert>
                </div>
              </div>
            </VCard>
          </div>
        </VForm>
      </VCardText>

      <!-- Enhanced Actions -->
      <VCardActions class="px-6 py-4 bg-grey-lighten-5 d-flex justify-space-between">
        <div class="d-flex align-center">
          <VIcon 
            icon="mdi-information"
            size="16"
            color="grey"
            class="mr-2"
          />
          <span class="text-caption text-grey">
            Calendar permissions can be configured after creation
          </span>
        </div>
        
        <div class="d-flex ga-3">
          <VBtn
            variant="text"
            color="grey"
            :disabled="loading"
            @click="handleCancel"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="loading"
            :disabled="!valid || !form.name.trim()"
            @click="handleSubmit"
          >
            <template #prepend>
              <VIcon icon="mdi-plus" size="18" />
            </template>
            Create Calendar
          </VBtn>
        </div>
      </VCardActions>

      <!-- Enhanced Error Display -->
      <VAlert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mx-6 mb-6"
      >
        <template #prepend>
          <VIcon icon="mdi-alert-circle" />
        </template>
        <div class="font-weight-medium">Failed to create calendar</div>
        <div class="text-body-2 mt-1">{{ errorMessage }}</div>
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
  isPublic?: boolean;
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
