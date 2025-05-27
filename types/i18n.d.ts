import type { i18nSchema } from "../locales/en";

type StringKey<T> = Extract<keyof T, string>;
type GenerateKeyPaths<T, Prefix extends string = ""> = T extends object
  ? {
      [K in StringKey<T>]: T[K] extends object ? GenerateKeyPaths<T[K], `${Prefix}${K}.`> : `${Prefix}${K}`;
    }[StringKey<T>]
  : Prefix;

declare global {
  type I18nKeys = GenerateKeyPaths<i18nSchema>;
}

declare module "vue" {
  interface ComponentCustomProperties {
    $t(key: I18nKeys): string;
  }
}
