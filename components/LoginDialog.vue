<template>
  <VDialog
    v-model="isOpen"
    max-width="450"
    persistent
  >
    <LoginForm @success="handleLoginSuccess">
      <template #addtional-actions>
        <VCol>
          <VBtn
            color="grey"
            size="default"
            block
            rounded="xl"
            :loading="authStore.isLoading"
            @click="handleCancel"
          >
            Cancel
          </VBtn>
        </VCol>
      </template>
    </LoginForm>
  </VDialog>
</template>

<script setup lang="ts">
interface Emits {
  (e: "success", message?: string): void;
}

const emit = defineEmits<Emits>();
const authStore = useAuthStore();

// Use defineModel for v-model binding
const isOpen = defineModel<boolean>({ default: false });

const handleLoginSuccess = () => {
  isOpen.value = false;
  emit("success", "Login successful! Welcome back.");
};

const handleCancel = () => {
  isOpen.value = false;
};
</script>
<style scoped></style>
