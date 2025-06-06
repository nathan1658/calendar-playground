<template>
  <VContainer
    class="fill-height"
    fluid
  >
    <VRow
      align="center"
      justify="center"
    >
      <VCol
        cols="12"
        sm="8"
        md="4"
      >
        <VCard class="elevation-12">
          <VToolbar
            color="primary"
            dark
            flat
          >
            <VToolbarTitle>Calendar App Login</VToolbarTitle>
          </VToolbar>
          <VCardText>
            <VForm @submit.prevent="handleLogin">
              <VTextField
                v-model="form.username"
                label="Username"
                name="username"
                prepend-icon="mdi-account"
                type="text"
                :error-messages="errors.username"
                required
                autocomplete="username"
                variant="outlined"
                class="mb-3"
                @keyup.enter="handleLogin"
              />

              <VTextField
                v-model="form.password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                :error-messages="errors.password"
                required
                autocomplete="current-password"
                variant="outlined"
                class="mb-3"
                @keyup.enter="handleLogin"
              />
            </VForm>
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn
              color="primary"
              :loading="isLoading"
              @click="handleLogin"
            >
              Login
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
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
const { status, signIn } = useAuth();
const isLoading = ref(false);

// Redirect if already authenticated
if (status.value === "authenticated") {
  await navigateTo("/");
}

const form = ref({
  username: "admin",
  password: "admin123",
});

const errors = ref({
  username: "",
  password: "",
});

const errorMessage = ref("");

const validateForm = () => {
  errors.value.username = "";
  errors.value.password = "";

  if (!form.value.username) {
    errors.value.username = "Username is required";
    return false;
  }

  if (!form.value.password) {
    errors.value.password = "Password is required";
    return false;
  }

  return true;
};

const handleLogin = async () => {
  errorMessage.value = "";

  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;

    await signIn("credentials", {
      username: form.value.username,
      password: form.value.password,
      callbackUrl: "/",
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    errorMessage.value =
      (error as { data?: { message?: string } })?.data?.message || "Login failed. Please check your credentials.";
  } finally {
    isLoading.value = false;
  }
};

// Set page meta
definePageMeta({
  layout: false,
  auth: false,
});
</script>
