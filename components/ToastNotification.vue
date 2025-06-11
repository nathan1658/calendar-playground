<template>
  <VSnackbar
    v-model="isVisible"
    :timeout="timeout"
    :color="color"
    :position="position"
    :multi-line="multiLine"
    class="toast-notification"
    elevation="6"
  >
    <div class="d-flex align-center">
      <VIcon
        :icon="iconName"
        class="mr-3"
        size="24"
      />
      <div class="flex-grow-1">
        <div class="font-weight-medium">{{ title }}</div>
        <div v-if="message" class="text-caption opacity-90">{{ message }}</div>
      </div>
    </div>
    
    <template #actions>
      <VBtn
        v-if="actionText"
        variant="text"
        size="small"
        @click="handleAction"
      >
        {{ actionText }}
      </VBtn>
      <VBtn
        icon
        variant="text"
        size="small"
        @click="isVisible = false"
      >
        <VIcon icon="mdi-close" />
      </VBtn>
    </template>
  </VSnackbar>
</template>

<script setup lang="ts">
export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timeout?: number;
  position?: 'top' | 'bottom';
  actionText?: string;
  onAction?: () => void;
  multiLine?: boolean;
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  timeout: 5000,
  position: 'bottom',
  multiLine: false,
});

const emit = defineEmits<{
  close: [];
  action: [];
}>();

const isVisible = ref(true);

const color = computed(() => {
  switch (props.type) {
    case 'success': return 'success';
    case 'error': return 'error';
    case 'warning': return 'warning';
    default: return 'info';
  }
});

const iconName = computed(() => {
  switch (props.type) {
    case 'success': return 'mdi-check-circle';
    case 'error': return 'mdi-alert-circle';
    case 'warning': return 'mdi-alert';
    default: return 'mdi-information';
  }
});

const handleAction = () => {
  emit('action');
  if (props.onAction) {
    props.onAction();
  }
};

watch(isVisible, (visible) => {
  if (!visible) {
    emit('close');
  }
});

// Auto-hide after timeout
if (props.timeout > 0) {
  setTimeout(() => {
    isVisible.value = false;
  }, props.timeout);
}
</script>

<style scoped>
.toast-notification {
  border-radius: 12px;
  backdrop-filter: blur(20px);
}

:deep(.v-snackbar__wrapper) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.v-snackbar__content) {
  padding: 16px 20px;
}

/* Animation enhancements */
.toast-notification {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>