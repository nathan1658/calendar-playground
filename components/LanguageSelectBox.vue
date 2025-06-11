<template>
  <div>
    <ClientOnly>
      <!-- Mobile View with Menu -->
      <VMenu>
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon="mdi-web"
            class="border rounded"
            variant="text"
            size="small"
          />
        </template>

        <VList density="compact">
          <VListItem
            v-for="item in locales"
            :key="item.code"
            :value="item.code"
            @click="computedLocale = item.code"
          >
            <VListItemTitle :style="{ 'font-size': fontSize }">
              {{ getLocaleDisplayName(item.code as i18nLocale) }}
            </VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </ClientOnly>
  </div>
</template>
<script lang="ts" setup>
import { i18nLocale } from "~/types";
const { locale, locales, setLocale, setLocaleCookie } = useI18n();

withDefaults(
  defineProps<{
    alwaysFullWidth: boolean;
    fontSize: string;
  }>(),
  {
    alwaysFullWidth: false,
    fontSize: "16px",
  },
);

const getLocaleDisplayName = (locale: i18nLocale): string => {
  switch (locale) {
    case i18nLocale["zh-tc"]:
      return "繁";
    case i18nLocale["zh-sc"]:
      return "简";
    case i18nLocale["en"]:
      return "Eng";
    default:
      return "";
  }
};

const computedLocale = computed({
  get: () => {
    return locale.value;
  },
  set: (lang: string) => {
    setLocaleCookie(lang);
    setLocale(lang);
  },
});
</script>
