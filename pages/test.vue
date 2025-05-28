<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-card>
          <v-card-title>Input Test</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="testInput"
              label="Test Input"
              variant="outlined"
              class="mb-3"
            />
            <p>
              <strong>Current value:</strong>
              {{ testInput }}
            </p>

            <v-text-field
              v-model="anotherInput"
              label="Another Test Input"
              variant="outlined"
              class="mb-3"
            />
            <p>
              <strong>Another value:</strong>
              {{ anotherInput }}
            </p>

            <v-btn @click="clearInputs">Clear All</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
