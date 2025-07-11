import { zhHant } from "vuetify/locale";
import type { i18nSchema } from "./en";

export default defineI18nLocale<i18nSchema>(async locale => {
  return {
    helloWorld: "你好",
    $vuetify: zhHant,
    auth: {
      login: {
        title: "歡迎回來",
        subtitle: "登入以存取你的日曆",
      },
    },
  };
});
