// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/main.css"],

  devtools: {
    enabled: true,
  },
  modules: [
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/eslint",
    "vuetify-nuxt-module",
    "@sidebase/nuxt-auth",
  ],
  typescript: {
    strict: true,
  },
  auth: {
    provider: {
      type: "authjs",
    },
    globalAppMiddleware: false,
  },

  runtimeConfig: {
    // Private keys (only available on server-side)
    mongodbUri: process.env.MONGODB_URI,
    authSecret: process.env.NUXT_AUTH_SECRET,
    initialAdminName: process.env.INITIAL_ADMIN_NAME || "admin",
    initialAdminPassword: process.env.INITIAL_ADMIN_PASSWORD || "password",
    authOrigin: process.env.NUXT_AUTH_ORIGIN || "http://localhost:3000",
    // Public keys (exposed to client-side)
    public: {
      authJs: {
        baseUrl: process.env.NUXT_AUTH_ORIGIN,
      },
    },
  },
  i18n: {
    langDir: "./i18n/locales",
    defaultLocale: "zh-tc",
    locales: [
      { code: "zh-tc", file: "zh-tc.ts", dir: "ltr" },
      { code: "zh-sc", file: "zh-sc.ts", dir: "ltr" },
      { code: "en", file: "en.ts", dir: "ltr" },
    ],
    detectBrowserLanguage: {
      fallbackLocale: "zh-tc",
    },
    strategy: "no_prefix",
  },
});
