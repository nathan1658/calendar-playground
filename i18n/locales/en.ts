import { en } from "vuetify/locale";

const schema = {
  $vuetify: en,
  helloWorld: "Hello World",
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to access your calendar",
    },
  },
};

export type i18nSchema = typeof schema;

export default defineI18nLocale<i18nSchema>(async locale => {
  return schema;
});
