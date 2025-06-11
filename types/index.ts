// =============================================================================
// CENTRALIZED TYPE EXPORTS
// =============================================================================

// Re-export all validation schemas and types
export * from './validation';

// Re-export all database interfaces
export * from './database';

// Re-export all API types
export * from './api';

// Re-export all frontend interfaces
export * from './frontend';

// =============================================================================
// LEGACY EXPORTS (keep for compatibility)
// =============================================================================

export enum i18nLocale {
  "en" = "en",
  "zh-sc" = "zh-sc",
  "zh-tc" = "zh-tc",
}
