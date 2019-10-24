<template>
  <v-app>
    <v-app-bar app>
        <img :src="require('./assets/title.png')" height="32"/>
      <v-spacer></v-spacer>
      <img :src="require('./assets/logo.jpeg')" height="56" style="margin-right: -16px;"/>
    </v-app-bar>

    <v-content>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import firebase from "firebase";

export default {
  name: "App",
  mounted() {
    var self = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user && self.$route.name == "index") {
        self.$router.replace("home");
      } else if (!user) {
        self.$router.replace("signup");
      }
    });
  },
  created() {
    this.$vuetify.theme.dark = true;
  }
};
</script>
