import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueFireStore from "vue-firestore";
import VueTheMask from "vue-the-mask";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

Vue.use(VueFireStore, { key: "id", enumerable: true });
Vue.use(VueTheMask);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
