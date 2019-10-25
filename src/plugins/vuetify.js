import Vue from "vue";
import Vuetify from "vuetify/lib";
import { Touch, Intersect, Ripple } from "vuetify/lib/directives";

Vue.use(Vuetify, {
  directives: {
    Touch,
    Intersect,
    Ripple
  }
});

export default new Vuetify({
  icons: {
    iconfont: "mdi"
  }
});
