<template>
  <BaseDialog
    v-model="isOpen"
    title="Welcome Back"
    subtitle="Sign in to access your calendar"
    icon="mdi-account-key"
    icon-color="primary"
    max-width="450"
    persistent
    :loading="isLoading"
    :actions="dialogActions"
  >
    <VForm
      ref="formRef"
      v-model="isFormValid"
      class="login-form"
      @submit.prevent="handleLogin"
    >
      <!-- Username Field -->
      <div class="form-section">
        <VTextField
          v-model="form.username"
          label="Username"
          placeholder="Enter your username"
          :rules="usernameRules"
          :error-messages="errors.username"
          required
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          autocomplete="username"
          class="enhanced-field"
          @keyup.enter="handleLogin"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-account"
              size="18"
              color="primary"
            />
          </template>
        </VTextField>
      </div>

      <!-- Password Field -->
      <div class="form-section">
        <VTextField
          v-model="form.password"
          label="Password"
          placeholder="Enter your password"
          :rules="passwordRules"
          :error-messages="errors.password"
          :type="showPassword ? 'text' : 'password'"
          required
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          autocomplete="current-password"
          class="enhanced-field"
          @keyup.enter="handleLogin"
        >
          <template #prepend-inner>
            <VIcon
              icon="mdi-lock"
              size="18"
              color="primary"
            />
          </template>
          <template #append-inner>
            <VBtn
              :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              variant="text"
              size="small"
              @click="showPassword = !showPassword"
            />
          </template>
        </VTextField>
      </div>

      <!-- Demo Credentials Info -->
      <div class="demo-credentials">
        <VIcon
          icon="mdi-information-outline"
          size="16"
          color="info"
          class="mr-2"
        />
        <div>
          <div class="text-caption font-weight-medium text-info">Demo Credentials</div>
          <div class="text-caption text-grey">
            Username:
            <strong>admin</strong>
            | Password:
            <strong>admin123</strong>
          </div>
        </div>
      </div>
    </VForm>

    <!-- Error Display -->
    <VAlert
      v-if="loginState === 'error' && errorMessage"
      type="error"
      variant="tonal"
      class="error-alert"
    >
      <template #prepend>
        <VIcon icon="mdi-alert-circle" />
      </template>
      <div class="font-weight-medium">Login Failed</div>
      <div class="text-body-2 mt-1">{{ errorMessage }}</div>
    </VAlert>
  </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from "~/components/base/BaseDialog.vue";

interface Emits {
  (e: "success", message?: string): void;
}

const emit = defineEmits<Emits>();

// Use defineModel for v-model binding
const isOpen = defineModel<boolean>({ default: false });

const { signIn } = useAuth();

const formRef = ref();
const isFormValid = ref(false);
const isLoading = ref(false);
const showPassword = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const loginState = ref<"idle" | "loading" | "success" | "error">("idle");

const form = ref({
  username: "admin",
  password: "admin123",
});

const errors = ref({
  username: "",
  password: "",
});

// Validation rules
const usernameRules = [
  (v: string) => !!v || "Username is required",
  (v: string) => (v && v.length >= 3) || "Username must be at least 3 characters",
];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => (v && v.length >= 6) || "Password must be at least 6 characters",
];

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
  successMessage.value = "";
  loginState.value = "loading";

  if (!validateForm()) {
    loginState.value = "idle";
    return;
  }

  try {
    isLoading.value = true;

    const result = await signIn("credentials", {
      username: form.value.username,
      password: form.value.password,
      callbackUrl: "/",
      redirect: false,
      external: false,
    });

    // Check if login was successful
    if (result?.error) {
      throw new Error(result.error);
    }

    // Success - close dialog immediately and emit success with message
    loginState.value = "success";
    isOpen.value = false;
    emit("success", "Login successful! Welcome back.");
    resetForm();
  } catch (error: unknown) {
    console.error("Login error:", error);
    loginState.value = "error";

    // Extract error message
    let message = "Login failed. Please check your credentials.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "object" && error !== null) {
      const errorObj = error as { data?: { message?: string }; message?: string };
      message = errorObj.data?.message || errorObj.message || message;
    }

    errorMessage.value = message;

    // Keep dialog open to show error
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  resetForm();
  isOpen.value = false;
};

const resetForm = () => {
  form.value = {
    username: "admin",
    password: "admin123",
  };
  errors.value = {
    username: "",
    password: "",
  };
  errorMessage.value = "";
  successMessage.value = "";
  loginState.value = "idle";
  showPassword.value = false;
  formRef.value?.resetValidation();
};

// Dialog actions
const dialogActions = computed(() => [
  {
    text: "Cancel",
    variant: "text" as const,
    color: "grey",
    disabled: isLoading.value,
    onClick: handleCancel,
  },
  {
    text: "Sign In",
    variant: "elevated" as const,
    color: "primary",
    loading: isLoading.value,
    disabled: !isFormValid.value,
    onClick: handleLogin,
  },
]);

// Reset form when dialog opens
watch(isOpen, newValue => {
  if (newValue) {
    resetForm();
  }
});
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-section {
  margin-bottom: 24px;
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: backwards;
}

.form-section:nth-child(1) {
  animation-delay: 0.1s;
}
.form-section:nth-child(2) {
  animation-delay: 0.2s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.enhanced-field {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.enhanced-field:hover {
  transform: translateY(-1px);
}

:deep(.enhanced-field .v-field) {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.enhanced-field:hover .v-field) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.enhanced-field .v-field--focused) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3);
  border-color: rgb(var(--v-theme-primary));
}

/* Demo Credentials Info */
.demo-credentials {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  background: rgba(var(--v-theme-info), 0.08);
  border: 1px solid rgba(var(--v-theme-info), 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-alert,
.error-alert {
  border-radius: 12px;
  margin-top: 16px;
  animation: slideInAlert 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInAlert {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.success-alert {
  background: rgba(var(--v-theme-success), 0.08);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

.error-alert {
  background: rgba(var(--v-theme-error), 0.08);
  border: 1px solid rgba(var(--v-theme-error), 0.2);
}

/* Password visibility toggle */
:deep(.v-field__append-inner .v-btn) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.v-field__append-inner .v-btn:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: scale(1.1);
}

/* Focus and accessibility improvements */
:deep(.v-field__input) {
  transition: all 0.2s ease;
}

/* Loading state for form */
.login-form[data-loading="true"] {
  opacity: 0.7;
  pointer-events: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-section {
    margin-bottom: 20px;
  }

  .demo-credentials {
    padding: 12px 16px;
  }
}

/* Enhanced field icons */
:deep(.v-field__prepend-inner .v-icon) {
  transition: all 0.2s ease;
}

:deep(.v-field--focused .v-field__prepend-inner .v-icon) {
  transform: scale(1.1);
}

/* Smooth transitions for all interactive elements */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
</style>
