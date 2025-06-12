// vuetify.config.ts
import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

export default defineVuetifyConfiguration({
  defaults: {
    VCard: {
      elevation: 0,
      rounded: "xl",
    },
    VTextField: {
      variant: "outlined",
      density: "compact",
      rounded: "lg",
      hideDetails: "auto",
    },
    VTextarea: {
      variant: "outlined",
      density: "compact",
      rounded: "lg",
      hideDetails: "auto",
    },
    VSelect: {
      variant: "outlined",
      density: "compact",
      rounded: "lg",
      hideDetails: "auto",
    },
    VBtn: {
      rounded: "lg",
      size: "small",
      elevation: 0,
    },
    VChip: {
      rounded: "lg",
      elevation: 0,
    },
    VDialog: {
      rounded: "xl",
      elevation: 24,
    },

    // Enhanced Navigation defaults
    VListItem: {
      rounded: "lg",
      style: "margin: 2px 8px;",
    },

    // Enhanced Data Table defaults
    VDataTable: {
      density: "compact",
      hover: true,
    },

    // Enhanced Breadcrumbs
    VBreadcrumbs: {
      density: "compact",
      divider: "/",
    },

    // Enhanced Form Components
    VCheckbox: {
      density: "compact",
    },
    VRadio: {
      density: "compact",
    },
    VSwitch: {
      density: "compact",
    },
    VTab: {
      size: "small",
    },
  },

  theme: {
    defaultTheme: "light",
    variations: {
      colors: ["primary", "secondary", "success", "warning", "error", "info"],
      lighten: 4,
      darken: 4,
    },
    themes: {
      light: {
        dark: false,
        colors: {
          // Surface colors - Clean and minimal
          background: "#fafbfc",
          surface: "#ffffff",
          "surface-variant": "#f8fafc",
          "surface-bright": "#ffffff",
          "surface-dim": "#f1f5f9",

          // Primary palette - Modern emerald
          primary: "#10b981",
          "primary-darken-1": "#059669",
          "primary-darken-2": "#047857",
          "primary-lighten-1": "#34d399",
          "primary-lighten-2": "#6ee7b7",

          // Secondary palette - Warm accent
          secondary: "#f59e0b",
          "secondary-darken-1": "#d97706",
          "secondary-lighten-1": "#fbbf24",

          // Semantic colors
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",

          // Text colors
          "on-background": "#0f172a",
          "on-surface": "#1e293b",
          "on-surface-variant": "#64748b",
          "on-primary": "#ffffff",
          "on-secondary": "#ffffff",
          "on-success": "#ffffff",
          "on-warning": "#ffffff",
          "on-error": "#ffffff",
          "on-info": "#ffffff",

          // Border and outline colors
          outline: "#e2e8f0",
          "outline-variant": "#cbd5e1",

          // Additional custom colors
          "slate-50": "#f8fafc",
          "slate-100": "#f1f5f9",
          "slate-200": "#e2e8f0",
          "slate-300": "#cbd5e1",
          "slate-400": "#94a3b8",
          "slate-500": "#64748b",
          "slate-600": "#475569",
          "slate-700": "#334155",
          "slate-800": "#1e293b",
          "slate-900": "#0f172a",
        },
      },
      dark: {
        dark: true,
        colors: {
          // Dark theme surface colors
          background: "#0f172a",
          surface: "#1e293b",
          "surface-variant": "#334155",
          "surface-bright": "#475569",
          "surface-dim": "#0f172a",

          // Primary palette for dark theme
          primary: "#34d399",
          "primary-darken-1": "#10b981",
          "primary-lighten-1": "#6ee7b7",

          // Secondary palette for dark theme
          secondary: "#fbbf24",
          "secondary-darken-1": "#f59e0b",

          // Semantic colors for dark theme
          success: "#34d399",
          warning: "#fbbf24",
          error: "#f87171",
          info: "#60a5fa",

          // Text colors for dark theme
          "on-background": "#f8fafc",
          "on-surface": "#e2e8f0",
          "on-surface-variant": "#94a3b8",
          "on-primary": "#064e3b",
          "on-secondary": "#451a03",

          // Border colors for dark theme
          outline: "#334155",
          "outline-variant": "#475569",
        },
      },
    },
  },

  // Enhanced display options
  display: {
    mobileBreakpoint: "sm",
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});
