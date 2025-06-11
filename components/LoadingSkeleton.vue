<template>
  <div class="loading-skeleton">
    <!-- Skeleton for statistics cards -->
    <VRow v-if="type === 'stats'" class="mb-6">
      <VCol v-for="i in 4" :key="i" cols="12" sm="6" lg="3">
        <VCard class="pa-4" elevation="0" border>
          <div class="d-flex align-center">
            <div class="mr-4">
              <VSkeletonLoader type="avatar" width="56" height="56" />
            </div>
            <div class="flex-grow-1">
              <VSkeletonLoader type="heading" class="mb-2" />
              <VSkeletonLoader type="text" width="100px" class="mb-2" />
              <VSkeletonLoader type="divider" height="4" />
            </div>
          </div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Skeleton for calendar -->
    <VCard v-else-if="type === 'calendar'" class="pa-4" elevation="0" border>
      <VSkeletonLoader type="heading" class="mb-4" />
      <VSkeletonLoader type="paragraph" class="mb-4" />
      <div class="d-flex flex-wrap gap-2 mb-4">
        <VSkeletonLoader v-for="i in 5" :key="i" type="chip" width="80" />
      </div>
      <VSkeletonLoader type="image" height="300" />
    </VCard>

    <!-- Skeleton for activity list -->
    <VCard v-else-if="type === 'activity'" elevation="0" border>
      <VCardTitle class="pa-4 pb-0">
        <VSkeletonLoader type="heading" width="150" />
      </VCardTitle>
      <VCardText class="pa-0">
        <div v-for="i in 5" :key="i" class="pa-4 border-b">
          <div class="d-flex align-center">
            <VSkeletonLoader type="avatar" size="32" class="mr-3" />
            <div class="flex-grow-1">
              <VSkeletonLoader type="text" width="200px" class="mb-1" />
              <VSkeletonLoader type="text" width="80px" />
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Skeleton for quick actions -->
    <VCard v-else-if="type === 'actions'" class="mb-4" elevation="0" border>
      <VCardTitle class="pa-4 pb-0">
        <VSkeletonLoader type="heading" width="120" />
      </VCardTitle>
      <VCardText class="pa-4">
        <VSkeletonLoader v-for="i in 3" :key="i" type="button" class="mb-3" block />
      </VCardText>
    </VCard>

    <!-- Generic skeleton -->
    <div v-else class="skeleton-content">
      <VSkeletonLoader type="paragraph" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'stats' | 'calendar' | 'activity' | 'actions' | 'generic';
}

defineProps<Props>();
</script>

<style scoped>
.loading-skeleton {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
}

.skeleton-content {
  padding: 16px;
}

/* Custom skeleton animations */
:deep(.v-skeleton-loader__bone) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Staggered loading animation */
.loading-skeleton .v-col:nth-child(1) {
  animation-delay: 0.1s;
}
.loading-skeleton .v-col:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-skeleton .v-col:nth-child(3) {
  animation-delay: 0.3s;
}
.loading-skeleton .v-col:nth-child(4) {
  animation-delay: 0.4s;
}
</style>