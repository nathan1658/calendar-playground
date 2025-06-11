<template>
  <VContainer>
    <VRow>
      <VCol
        cols="12"
        md="6"
      >
        <VCard>
          <VCardTitle>Input Test</VCardTitle>
          <VCardText>
            <VTextField
              v-model="testInput"
              label="Test Input"
              variant="outlined"
              class="mb-3"
            />
            <p>
              <strong>Current value:</strong>
              {{ testInput }}
            </p>

            <VTextField
              v-model="anotherInput"
              label="Another Test Input"
              variant="outlined"
              class="mb-3"
            />
            <p>
              <strong>Another value:</strong>
              {{ anotherInput }}
            </p>

            <VBtn @click="clearInputs">Clear All</VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
const testInput = ref("");
const anotherInput = ref("");

const clearInputs = () => {
  testInput.value = "";
  anotherInput.value = "";
};

// Set page meta
definePageMeta({
  auth: false,
});
</script>
