import { en } from "vuetify/locale";

const schema = {
  $vuetify: en,
  helloWorld: "Hello World",
};

export type i18nSchema = typeof schema;

export default defineI18nLocale<i18nSchema>(async locale => {
  return schema;
});
