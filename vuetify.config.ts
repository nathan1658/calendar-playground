// vuetify.config.ts
import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

export default defineVuetifyConfiguration({
  defaults: {
    VCard: {},
    VTextField: {
      variant: "outlined",
    },
    VTextarea: {
      variant: "outlined",
    },
    VSelect: {
      variant: "outlined",
    },
    VBreadcrumb: {
      color: "primary",
      density: "comfortable",
    },
    VCheckbox: {},
  },
  theme: {
    variations: {
      colors: ["primary", "secondary"],
      lighten: 5,
      darken: 5,
    },
    themes: {
      light: {
        dark: false,
        colors: {
          background: "#FAFBFF",
          primary: "#1C9363",
          secondary: "#DA9F28",
          accent: "#8347AD",
          error: "#f44336",
          warning: "#ff9800",
          info: "#00bcd4",
          success: "#9c27b0",
        },
      },
    },
  },
});
