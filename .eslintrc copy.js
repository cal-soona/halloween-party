module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended",
    "plugin:jest/recommended",
    "@vue/prettier"
  ],
  env: {
    node: true,
    browser: true,
    "jest/globals": true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module",
    allowImportExportEverywhere: false
  },
  rules: {
    "prettier/prettier": "error",

    // TODO: remove rules below this line
    "vue/no-use-v-if-with-v-for": "off",
    "vue/require-default-prop": "off",
    "vue/require-prop-types": "off",
    "vue/no-v-html": "off",
    "vue/prop-name-casing": "off"
  }
};
