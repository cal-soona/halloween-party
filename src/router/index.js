import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import SignUp from "../views/SignUp.vue";
import SignIn from "../views/SignIn.vue";
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
    path: "/signin",
    name: "signin",
    component: SignIn
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
