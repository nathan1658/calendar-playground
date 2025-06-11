<template>
  <VCard
    :class="cardClasses"
    :elevation="elevation"
    :variant="variant"
    :color="color"
    v-bind="$attrs"
  >
    <!-- Header Section -->
    <VCardTitle 
      v-if="title || $slots.title || actions.length > 0"
      class="pa-4 pb-0"
    >
      <div class="d-flex align-center justify-space-between">
        <!-- Title Content -->
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
              <div class="text-h6 font-weight-bold">{{ title }}</div>
            </slot>
            <div v-if="subtitle" class="text-body-2 text-grey mt-1">
              {{ subtitle }}
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div v-if="actions.length > 0 || $slots.actions" class="d-flex align-center gap-2">
          <slot name="actions">
            <VBtn
              v-for="action in actions"
              :key="action.text"
              :variant="action.variant || 'text'"
              :color="action.color || 'default'"
              :size="action.size || 'small'"
              :prepend-icon="action.icon"
              @click="action.onClick"
            >
              {{ action.text }}
            </VBtn>
          </slot>
        </div>
      </div>
    </VCardTitle>

    <!-- Content Section -->
    <VCardText 
      :class="contentClasses"
      :style="contentStyle"
    >
      <slot />
    </VCardText>

    <!-- Footer Section -->
    <VCardActions 
      v-if="$slots.footer"
      class="px-4 pb-4"
    >
      <slot name="footer" />
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
interface Action {
  text: string;
  onClick: () => void;
  icon?: string;
  variant?: 'text' | 'outlined' | 'elevated' | 'flat' | 'tonal' | 'plain';
  color?: string;
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large';
}

interface Props {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: string | number;
  elevation?: number | string;
  variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain';
  color?: string;
  padding?: boolean;
  contentClass?: string;
  hover?: boolean;
  actions?: Action[];
  loading?: boolean;
  height?: string | number;
  maxHeight?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 1,
  variant: 'elevated',
  padding: true,
  hover: true,
  actions: () => [],
  iconSize: 24,
});

// Computed classes and styles
const cardClasses = computed(() => [
  'base-card',
  {
    'base-card--hover': props.hover,
    'base-card--loading': props.loading,
  }
]);

const contentClasses = computed(() => [
  {
    'pa-4': props.padding,
    'pa-0': !props.padding,
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
.base-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.base-card--hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.base-card--loading {
  opacity: 0.7;
  pointer-events: none;
}

.base-card--loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Content styling */
:deep(.v-card-title) {
  padding-bottom: 0 !important;
}

:deep(.v-card-text) {
  position: relative;
}

/* Smooth scrolling for content */
:deep(.v-card-text::-webkit-scrollbar) {
  width: 6px;
}

:deep(.v-card-text::-webkit-scrollbar-track) {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

:deep(.v-card-text::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

:deep(.v-card-text::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 0, 0, 0.3);
}

/* Action button enhancements */
:deep(.v-btn) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-btn:hover) {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .base-card {
    border-radius: 12px;
  }
  
  :deep(.v-card-title) {
    padding: 16px 16px 0 !important;
  }
  
  :deep(.v-card-text) {
    padding: 16px !important;
  }
}
</style>
