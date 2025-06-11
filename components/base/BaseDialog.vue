<template>
  <VDialog
    v-model="isOpen"
    :max-width="maxWidth"
    :persistent="persistent"
    :fullscreen="fullscreen"
    :scrollable="scrollable"
    class="base-dialog"
  >
    <VCard class="dialog-card">
      <!-- Header -->
      <VCardTitle class="pa-6 pb-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon
              v-if="icon"
              :icon="icon"
              :color="iconColor"
              class="mr-3"
              :size="iconSize"
            />
            <div>
              <slot name="title">
                <div class="text-h5 font-weight-bold">{{ title }}</div>
              </slot>
              <div v-if="subtitle" class="text-body-2 text-grey mt-1">
                {{ subtitle }}
              </div>
            </div>
          </div>
          
          <VBtn
            v-if="!persistent"
            icon
            variant="text"
            size="small"
            @click="isOpen = false"
          >
            <VIcon icon="mdi-close" />
          </VBtn>
        </div>
      </VCardTitle>

      <!-- Content -->
      <VCardText 
        :class="contentClasses"
        :style="contentStyle"
      >
        <slot />
      </VCardText>

      <!-- Actions -->
      <VCardActions 
        v-if="$slots.actions || actions.length > 0"
        class="pa-6 pt-4"
      >
        <VSpacer />
        <slot name="actions">
          <VBtn
            v-for="action in actions"
            :key="action.text"
            :variant="action.variant || 'text'"
            :color="action.color || 'default'"
            :loading="action.loading"
            :disabled="action.disabled"
            @click="action.onClick"
          >
            {{ action.text }}
          </VBtn>
        </slot>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
interface Action {
  text: string;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'elevated' | 'flat' | 'tonal' | 'plain';
  color?: string;
  loading?: boolean;
  disabled?: boolean;
}

interface Props {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: string | number;
  maxWidth?: string | number;
  persistent?: boolean;
  fullscreen?: boolean;
  scrollable?: boolean;
  contentClass?: string;
  actions?: Action[];
  loading?: boolean;
  height?: string | number;
  maxHeight?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  icon: '',
  iconColor: '',
  maxWidth: 500,
  persistent: false,
  fullscreen: false,
  scrollable: true,
  contentClass: '',
  actions: () => [],
  iconSize: 24,
  height: undefined,
  maxHeight: undefined,
});

const emit = defineEmits<{
  close: [];
}>();

// Use defineModel for v-model binding
const isOpen = defineModel<boolean>({ default: false });

// Watch for dialog close to emit close event
watch(isOpen, (newValue) => {
  if (!newValue) {
    emit('close');
  }
});

// Computed classes and styles
const contentClasses = computed(() => [
  'pa-6',
  {
    'dialog-content--loading': props.loading,
  },
  props.contentClass,
]);

const contentStyle = computed(() => ({
  height: props.height ? `${props.height}px` : undefined,
  maxHeight: props.maxHeight ? `${props.maxHeight}px` : undefined,
  overflow: props.maxHeight ? 'auto' : undefined,
}));
</script>

<style scoped>
.base-dialog {
  z-index: 1000;
}

.dialog-card {
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  overflow: hidden;
  animation: dialogSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header styling */
:deep(.v-card-title) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
}

/* Content styling */
.dialog-content--loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Action buttons */
:deep(.v-card-actions) {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(248, 250, 252, 0.8);
}

:deep(.v-card-actions .v-btn) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 80px;
}

:deep(.v-card-actions .v-btn:hover) {
  transform: translateY(-1px);
}

/* Close button */
:deep(.v-btn--icon) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-btn--icon:hover) {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

/* Scrollbar styling */
:deep(.v-card-text::-webkit-scrollbar) {
  width: 8px;
}

:deep(.v-card-text::-webkit-scrollbar-track) {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

:deep(.v-card-text::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

:deep(.v-card-text::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 0, 0, 0.3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dialog-card {
    border-radius: 16px;
    margin: 16px;
  }
  
  :deep(.v-card-title) {
    padding: 20px 20px 16px !important;
  }
  
  :deep(.v-card-text) {
    padding: 20px !important;
  }
  
  :deep(.v-card-actions) {
    padding: 16px 20px 20px !important;
  }
}

/* Focus trap for accessibility */
.dialog-card:focus {
  outline: none;
}

/* Loading state overlay */
.dialog-content--loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Enhanced elevation on hover */
.dialog-card:hover {
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.2);
}

/* Smooth transitions */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>