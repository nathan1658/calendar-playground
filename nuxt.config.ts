// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/main.css"],

  devtools: {
    enabled: true,
  },
  modules: [],
  typescript: {
    strict: true,
  },
  extends: [["github:wongwong25/hksh-nuxt-base-layer#master", { forceClean: true }]],
  auth: {
    globalAppMiddleware: false,
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    mongodbUri: process.env.MONGODB_URI,
    authSecret: process.env.NUXT_AUTH_SECRET,
    initialAdminName: process.env.INITIAL_ADMIN_NAME || "admin",
    initialAdminPassword: process.env.INITIAL_ADMIN_PASSWORD || "password",
  },
  i18n: {
    locales: [
      { code: "en", file: "en.ts", dir: "ltr" },
      { code: "zh-tc", file: "zh-tc.ts", dir: "ltr" },
      { code: "zh-sc", file: "zh-sc.ts", dir: "ltr" },
    ],
    strategy: "no_prefix",
  },
});
