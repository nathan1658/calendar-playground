import { zhHans } from "vuetify/locale";
import type { i18nSchema } from "./en";

export default defineI18nLocale<i18nSchema>(async locale => {
  return {
    helloWorld: "你好",
    $vuetify: zhHans,
    auth: {
      login: {
        title: "欢迎回来",
        subtitle: "登入以存取你的日历",
      },
    },
  };
});
