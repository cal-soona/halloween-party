import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import SignUp from "../views/SignUp.vue";
import Index from "../views/Index.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/home",
    name: "home",
    component: Home
  },
  {
    path: "/signup",
    name: "signup",
    component: SignUp
  },
  {
    path: "/",
    name: "index",
    component: Index
  }
];

const router = new VueRouter({
  routes
});

export default router;
