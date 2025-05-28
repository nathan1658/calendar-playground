import { zhHans } from "vuetify/locale";
import type { i18nSchema } from "./en";

export default defineI18nLocale<i18nSchema>(async locale => {
  return {
    helloWorld: "你好",
    $vuetify: zhHans,
  };
});
