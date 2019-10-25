<template>
  <v-overlay :value="overlay">
    <v-progress-circular indeterminate size="344">
      <v-card shaped height="128" width="128">
        <img :src="require('../assets/logo.jpeg')" height="128" />
      </v-card>
    </v-progress-circular>
  </v-overlay>
</template>

<script>
export default {
  name: "index"
};
</script>
