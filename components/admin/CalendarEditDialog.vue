<template>
  <VDialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>Edit Calendar</VCardTitle>

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
          Update
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
interface Calendar {
  id: string;
  name: string;
  category?: string;
}

interface Props {
  modelValue: boolean;
  calendar: Calendar | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "updated"): void;
}

interface UpdateCalendarPayload {
  name?: string;
  category?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const form = ref({
  name: "",
  category: "",
});

const nameRules = [
  (v: string) => !!v || "Calendar name is required",
  (v: string) => v.length <= 100 || "Name must be less than 100 characters",
];

const categoryRules = [(v: string) => !v || v.length <= 50 || "Category must be less than 50 characters"];

const handleSubmit = async () => {
  if (!valid.value || !props.calendar) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const payload: UpdateCalendarPayload = {};

    if (form.value.name !== props.calendar.name) {
      payload.name = form.value.name;
    }

    if (form.value.category !== (props.calendar.category || "")) {
      payload.category = form.value.category || undefined;
    }

    await $fetch(`/api/calendars/${props.calendar.id}`, {
      method: "PUT",
      body: payload,
    });

    emit("updated");
    handleCancel();
  } catch (error: unknown) {
    if (error && typeof error === "object" && "data" in error) {
      errorMessage.value = (error as { data?: { message?: string } }).data?.message || "Failed to update calendar";
    } else {
      errorMessage.value = "Failed to update calendar";
    }
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  errorMessage.value = "";
  emit("update:modelValue", false);
};

// Watch for calendar changes to populate form
watch(
  () => props.calendar,
  newCalendar => {
    if (newCalendar) {
      form.value = {
        name: newCalendar.name,
        category: newCalendar.category || "",
      };
    }
  },
  { immediate: true },
);

// Reset form when dialog closes
watch(
  () => props.modelValue,
  newValue => {
    if (!newValue) {
      form.value = {
        name: "",
        category: "",
      };
    }
  },
);
</script>
