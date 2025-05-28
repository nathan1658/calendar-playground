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
    isEnabled: true,
    disableServerSideAuth: false,
    globalAppMiddleware: true,
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
    provider: {
      type: "local",
      endpoints: {
        signIn: { path: "/login", method: "post" },
        signOut: { path: "/logout", method: "post" },
        signUp: { path: "/register", method: "post" },
        getSession: { path: "/session", method: "get" },
      },
      token: {
        signInResponseTokenPointer: "/token",
        type: "Bearer",
        cookieName: "auth-token",
        headerName: "Authorization",
        maxAgeInSeconds: 1800,
        sameSiteAttribute: "strict",
        httpOnlyCookieAttribute: true,
      },
      pages: {
        login: "/login",
      },
    },
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    mongodbUri: process.env.MONGODB_URI,
    authSecret: process.env.NUXT_AUTH_SECRET,

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
