import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // files: ["**/*.ts", "**/*.vue"],
  // languageOptions: {
  //   parserOptions: {
  //     ecmaVersion: 2022,
  //   },
  // },
  rules: {
    "vue/valid-v-slot": [
      "error",
      {
        allowModifiers: true,
      },
    ],
    "vue/component-name-in-template-casing": [
      "error",
      "PascalCase",
      {
        registeredComponentsOnly: false,
        ignores: [],
      },
    ],
  },
})
