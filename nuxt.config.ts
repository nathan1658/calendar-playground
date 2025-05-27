// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/main.css"],
  nitro: {
    preset: "firebase",
    firebase: {
      nodeVersion: "20",
      gen: 2,
      httpsOptions: {
        region: "asia-east2",
        maxInstances: 3,
      },
    },
  },
  devtools: {
    enabled: true,
  },
  modules: ["@pinia/nuxt", "@vueuse/nuxt", "@nuxtjs/i18n", "@nuxt/eslint", "vuetify-nuxt-module", "nuxt-vuefire"],
  typescript: {
    strict: true,
  },
  i18n: {
    langDir: "./locales",
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
  vuefire: {
    emulators: false,
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
});
