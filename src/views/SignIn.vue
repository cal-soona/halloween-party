<template>
  <v-row justify="center">
    <v-col cols="12" sm="10" md="8" lg="6">
      <v-overlay :value="overlay">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
      <v-card>
        <v-expand-transition>
          <v-form v-if="isSignIn" v-model="signinValid" lazy-validation ref="signinForm">
            <v-card-text>
              <h3>your digits?</h3>
              <v-text-field
                v-model="phoneNumber"
                :rules="phoneRules"
                label="phone number"
                hint="123-123-1234"
                v-mask="'###-###-####'"
                required
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text id="sign-in-button" @click="signIn">get spooky</v-btn>
            </v-card-actions>
          </v-form>
        </v-expand-transition>
      </v-card>
      <v-card>
        <v-expand-transition>
          <v-form v-if="isVerify" v-model="verifyValid" lazy-validation ref="verifyForm">
            <v-card-text>
              <h3>enter your verification code</h3>
              <v-text-field
                v-model="verifyNumber"
                :rules="verifyRules"
                label="verification code"
                v-mask="'######'"
                required
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" text @click="confirm">very spooky</v-btn>
            </v-card-actions>
          </v-form>
        </v-expand-transition>
      </v-card>
    </v-col>

    <v-card>
      <v-card-actions>
        <v-card-text>haven't got spooky yet?</v-card-text>
        <v-btn color="primary" text @click="$router.replace('signup')">Sign Up</v-btn>
      </v-card-actions>
    </v-card>
  </v-row>
</template>

<script>
//import { db } from "../firebase";
import firebase from "firebase";

const LOGIN_STATUS_SIGNIN = 0,
  LOGIN_STATUS_VERIFY = 1;

export default {
  name: "signIn",
  data() {
    return {
      snackbar: true,
      overlay: false,
      mode: null,
      phoneNumber: "",
      phoneRules: [
        v => !!v || "Phone is required",
        v => /^\d{3}-\d{3}-\d{4}$/.test(v) || "please enter 10 digits"
      ],
      verifyRules: [
        v => !!v || "Verification Code is required",
        v => /^\d{6}$/.test(v) || "please enter 6 digits"
      ],
      verifyNumber: "",
      verifyValid: false,
      signinValid: false,
      confirmationResult: null,
      recaptchaVerifier: null
    };
  },
  computed: {
    isSignIn() {
      return this.mode === LOGIN_STATUS_SIGNIN;
    },
    isVerify() {
      return this.mode === LOGIN_STATUS_VERIFY;
    }
  },
  mounted: function() {
    var self = this;
    self.reset();
    this.$nextTick(() => {
      self.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        "sign-in-button",
        {
          size: "invisible"
        }
      );
    });
  },
  methods: {
    reset() {
      this.mode = LOGIN_STATUS_SIGNIN;
    },
    signIn: async function() {
      try {
        this.overlay = true;
        if (this.$refs.signinForm.validate()) {
          this.confirmationResult = await firebase
            .auth()
            .signInWithPhoneNumber(
              "+1" + this.phoneNumber,
              this.recaptchaVerifier
            );
          this.mode = LOGIN_STATUS_VERIFY;
          this.$vuetify.goTo(0);
        }
      } catch (err) {
        alert("whoops something went wrong... try again");
      } finally {
        this.overlay = false;
      }
    },
    confirm: async function() {
      if (this.$refs.verifyForm.validate()) {
        try {
          this.overlay = true;
          await this.confirmationResult.confirm(this.verifyNumber);
          this.$router.replace("home");
        } catch (err) {
          alert("invalid code, try again...");
        } finally {
          this.overlay = false;
        }
      }
    }
  }
};
</script>
