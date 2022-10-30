<template>
  <v-row justify="center">
    <v-col cols="12" sm="10" md="8" lg="6">
      <div v-show="false">{{ profiles }}</div>
      <v-subheader v-if="currentProfile && isEarly"
        >spooky, dope, or nah?</v-subheader
      >
      <v-fade-transition>
        <v-expand-x-transition mode="out-in" v-if="currentProfile">
          <v-card
            max-width="344"
            class="mx-auto"
            :key="currentProfile.id"
            elevation="20"
          >
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="headline">
                  {{ currentProfile.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-img :src="currentProfile.imageURL" height="50vh">
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>

            <v-card-text>{{ currentProfile.description }}</v-card-text>

            <v-card-actions>
              <v-btn color="error" x-large icon @click="hate">
                <v-icon x-large>mdi-thumb-down</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn x-large icon @click="like">
                <v-icon x-large>mdi-thumb-up</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-expand-x-transition>
        <div v-else style="text-align: center">
          <div v-if="isEarly">
            <div class="timer-container">
              <div class="timer-block">
                <div>{{ displayHours }}</div>
                <div class="time-text">
                  hours
                </div>
              </div>
              <div class="timer-block">
                <div>{{ displayMinutes }}</div>
                <div class="time-text">
                  minutes
                </div>
              </div>
              <div class="timer-block">
                <div>{{ displaySeconds }}</div>
                <div class="time-text">
                  seconds
                </div>
              </div>
            </div>
            <h2>until voting ends</h2>
          </div>
          <h1 v-if="isLate">the final results are in!</h1>
          <h1 v-if="isEarly">here's where everyone stands.</h1>
          <h2 v-if="myProfile.superLeft > 0">
            you have {{ myProfile.superLeft }} more votes to pick your
            favorites!
          </h2>
          <v-slide-y-transition group>
            <v-col v-for="p in sortedProfiles" :key="p.id" cols="12">
              <v-card :max-width="344" class="mx-auto" :elevation="20">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="headline">
                      {{ p.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      rank:
                      {{ sortedProfiles.indexOf(p) + 1 }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-img :src="p.imageURL" height="50vh" :key="p.id" :id="p.id">
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="grey lighten-5"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>

                <v-card-text>{{ p.description }}</v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    v-if="isEarly"
                    rounded
                    color="error"
                    x-large
                    @click="superLike(p.id)"
                    :disabled="myProfile.superLeft == 0"
                  >
                    <v-icon x-large>mdi-heart</v-icon>
                    <span>{{ myProfile.superLeft }} left</span>
                  </v-btn>
                  <h2 v-if="isLate && sortedProfiles.indexOf(p) < showTop">
                    {{ p.rank }} votes
                  </h2>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-slide-y-transition>

          <h3>check back later for more spooky costumes</h3>
        </div>
      </v-fade-transition>
    </v-col>
  </v-row>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { db } from '../firebase';

export default {
  name: 'home',
  data() {
    return {
      currentProfile: null,
      profiles: [],
      config: [],
      myProfile: {
        superLeft: 0,
      },
      intersectId: [],
      displayHours: 0,
      displayMinutes: 0,
      displaySeconds: 0,
      displayDays: 0,
      isEarly: false,
      isLate: false,
      timer: null,
    };
  },
  mounted() {
    this.showRemaining();
    this.$binding('profiles', db.collection('profiles')).then(() => {
      this.myProfile = this.profiles.find(
        p => p.id == firebase.auth().currentUser.uid
      );
      this.findNext();
    });
  },
  firestore() {
    return {
      profiles: db.collection('profiles'),
      config: db.collection('config'),
    };
  },
  beforeUpdate() {
    if (this.currentProfile == null && this.filteredProfiles.length > 0) {
      this.findNext();
    }
  },
  methods: {
    findNext() {
      this.myProfile = this.profiles.find(
        p => p.id == firebase.auth().currentUser.uid
      );
      let pick = Math.floor(Math.random() * this.filteredProfiles.length);
      this.currentProfile =
        this.filteredProfiles.length > 0 ? this.filteredProfiles[pick] : null;
    },
    like() {
      this.vote(1);
    },
    hate() {
      this.vote(-1);
    },
    superLike(id) {
      this.spendSuper().then(() => {
        this.superVote(id);
      });
    },
    vote(val) {
      this.$firestore.profiles
        .doc(this.currentProfile.id)
        .update({
          votes: firebase.firestore.FieldValue.arrayUnion({
            user: firebase.auth().currentUser.uid,
            vote: val,
            vid: Math.random() * 100000000,
          }),
        })
        .then(() => {
          this.findNext();
        });
    },
    superVote(id) {
      this.$firestore.profiles
        .doc(id)
        .update({
          votes: firebase.firestore.FieldValue.arrayUnion({
            user: firebase.auth().currentUser.uid,
            vote: 2,
            vid: Math.random() * 100000000,
          }),
        })
        .then(() => {
          this.findNext();
        });
    },
    spendSuper() {
      return this.$firestore.profiles
        .doc(firebase.auth().currentUser.uid)
        .update({
          superLeft: this.myProfile.superLeft - 1,
        });
    },
    onIntersect(ent) {
      if (ent[0].isIntersecting) {
        this.intersectId.push(ent[0].target.id);
      } else {
        if (this.intersectId.indexOf(ent[0].target.id) >= 0) {
          this.intersectId.splice(this.intersectId.indexOf(ent[0].target.id));
        }
      }
    },
    formatNum: num => (num < 10 ? '0' + num : num),
    showRemaining() {
      this.timer = setInterval(() => {
        const NOW = new Date();
        this.isEarly = NOW < this.endDate;
        this.isLate = NOW > this.endDate;
        const DISTANCE = this.endDate.getTime() - NOW.getTime();
        if (DISTANCE < 0) {
          clearInterval(this.timer);
          this.expired = true;
          this.loaded = true;
          return;
        }

        const DAYS = Math.floor(DISTANCE / this._days);
        const HOURS = Math.floor((DISTANCE % this._days) / this._hours);
        const MINUTES = Math.floor((DISTANCE % this._hours) / this._minutes);
        const SECONDS = Math.floor((DISTANCE % this._minutes) / this._seconds);
        this.displayMinutes = this.formatNum(MINUTES);
        this.displaySeconds = this.formatNum(SECONDS);
        this.displayHours = this.formatNum(HOURS);
        this.displayDays = this.formatNum(DAYS);
        this.loaded = true;
      }, 1000);
      this.calculateTime();
    },
    calculateTime() {
      const NOW = new Date();
      this.isEarly = NOW < this.endDate;
      this.isLate = NOW > this.endDate;
      const DISTANCE = this.endDate.getTime() - NOW.getTime();
      if (DISTANCE < 0) {
        clearInterval(this.timer);
        this.expired = true;
        this.loaded = true;
        return;
      }

      const DAYS = Math.floor(DISTANCE / this._days);
      const HOURS = Math.floor((DISTANCE % this._days) / this._hours);
      const MINUTES = Math.floor((DISTANCE % this._hours) / this._minutes);
      const SECONDS = Math.floor((DISTANCE % this._minutes) / this._seconds);
      this.displayMinutes = this.formatNum(MINUTES);
      this.displaySeconds = this.formatNum(SECONDS);
      this.displayHours = this.formatNum(HOURS);
      this.displayDays = this.formatNum(DAYS);
      this.loaded = true;
    },
  },
  computed: {
    filteredProfiles() {
      return this.profiles.filter(
        p =>
          p.id != firebase.auth().currentUser.uid &&
          (p.votes == null ||
            p.votes.find(v => v.user == firebase.auth().currentUser.uid) ==
              null)
      );
    },
    sortedProfiles() {
      return this.profiles
        .map(p => {
          return {
            id: p.id,
            name: p.name,
            imageURL: p.imageURL,
            description: p.description,
            rank: p.votes
              ? p.votes.map(v => v.vote).reduce((a, b) => a + b, 0)
              : 0,
          };
        })
        .sort((a, b) => b.rank - a.rank);
    },
    showTop() {
      return this.config.length > 0 ? this.config[0].showTop : 2;
    },
    endDate() {
      return this.config.length > 0
        ? new Date(this.config[0].endTime)
        : new Date(1635651000000);
    },
    _seconds: () => 1000,
    _minutes() {
      return this._seconds * 60;
    },
    _hours() {
      return this._minutes * 60;
    },
    _days() {
      return this._hours * 24;
    },
  },
};
</script>

<style scoped lang="scss">
.timer-container {
  display: flex;
  justify-content: center;
}

.timer-block {
  font-size: 48px;
  float: left;
  padding: 10px;
}
.time-text {
  letter-spacing: 2px;
  font-size: 8px;
  text-transform: uppercase;
}
.timer-div {
  padding: 20px;
  letter-spacing: 1px;
  font-size: 14px;
  width: 50%;
  float: left;
}

@media screen and (max-width: 768px) {
  .timer-div {
    width: 100%;
    float: none;
  }
}
</style>
