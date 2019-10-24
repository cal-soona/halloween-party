<template>
  <v-row justify="center">
    <v-col cols="12" sm="10" md="8" lg="6">
      <v-overlay :value="overlay">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
      <v-card>
        <v-expand-transition>
          <v-form
            v-if="isCreate"
            v-model="signupValid"
            lazy-validation
            ref="createForm"
          >
            <v-card-text>
              <h3>who are you tonight?</h3>
              <v-text-field
                v-model="name"
                :rules="nameRules"
                label="costume name"
                required
              ></v-text-field>
              <h3>what do you look like?</h3>
              <v-expand-transition mode="out-in">
                <form
                  enctype="multipart/form-data"
                  novalidate
                  v-if="isInitial || isSaving || isFailed"
                >
                  <div class="dropbox">
                    <input
                      type="file"
                      :name="uploadFieldName"
                      :disabled="isSaving"
                      @change="filesChange($event.target)"
                      accept="image/*"
                      class="input-file"
                    />
                    <p v-if="isInitial">tap here to upload a photo</p>
                    <p v-if="isFailed">something went wrong... try again?</p>
                    <p v-if="isSaving">{{ uploadProgress }}%</p>
                  </div>
                </form>
                <v-col v-else>
                  <v-img :src="imageURL" contain height="50vh">
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
                </v-col>
              </v-expand-transition>

              <h3>say something clever...</h3>
              <v-text-field
                v-model="description"
                label="tag line"
              ></v-text-field>

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
              <v-btn color="error" text id="sign-in-button" @click="signUp"
                >get spooky</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-expand-transition>
      </v-card>
      <v-card>
        <v-expand-transition>
          <v-form
            v-if="isVerify"
            v-model="verifyValid"
            lazy-validation
            ref="verifyForm"
          >
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
        <v-card-text>already got spooky?</v-card-text>
        <v-btn color="primary" text @click="$router.replace('signin')"
          >Sign In</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-row>
</template>

<script>
import { db } from "../firebase";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const LOGIN_STATUS_CREATE = 0,
  LOGIN_STATUS_VERIFY = 1;
const UPLOAD_STATUS_INITIAL = 0,
  UPLOAD_STATUS_SAVING = 1,
  UPLOAD_STATUS_SUCCESS = 2,
  UPLOAD_STATUS_FAILED = 3;

export default {
  name: "signUp",
  data() {
    return {
      overlay: false,
      mode: null,
      description: "",
      uploadStatus: null,
      name: "",
      nameRules: [v => !!v || "Name is required"],
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
      signupValid: false,
      confirmationResult: null,
      recaptchaVerifier: null,
      uploadFieldName: "photo",
      uploadProgress: 0,
      imageURL: "",
      imageURLSafe: ""
    };
  },
  computed: {
    isCreate() {
      return this.mode === LOGIN_STATUS_CREATE;
    },
    isVerify() {
      return this.mode === LOGIN_STATUS_VERIFY;
    },
    isInitial() {
      return this.uploadStatus === UPLOAD_STATUS_INITIAL;
    },
    isSaving() {
      return this.uploadStatus === UPLOAD_STATUS_SAVING;
    },
    isSuccess() {
      return this.uploadStatus === UPLOAD_STATUS_SUCCESS;
    },
    isFailed() {
      return this.uploadStatus === UPLOAD_STATUS_FAILED;
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
      this.mode = LOGIN_STATUS_CREATE;
      this.uploadStatus = UPLOAD_STATUS_INITIAL;
    },
    filesChange: async function(target) {
      var storageRef = firebase.storage().ref();
      var self = this;

      self.uploadStatus = UPLOAD_STATUS_SAVING;

      var entry = await db
        .collection("images")
        .add({ imageName: target.files[0].name });
      var uploadTask = storageRef.child(entry.id).put(target.files[0]);

      uploadTask.on(
        "state_changed",
        function(snapshot) {
          self.uploadProgress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
        },
        function() {
          self.uploadStatus = UPLOAD_STATUS_FAILED;
        },
        function() {
          self.uploadStatus = UPLOAD_STATUS_SUCCESS;
          uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            self.imageURLSafe = downloadURL;
            setTimeout(() => {
              self.imageURL = downloadURL;
            }, 10000);
          });
        }
      );
    },
    signUp: async function() {
      try {
        this.overlay = true;
        if (this.$refs.createForm.validate()) {
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
      var self = this;
      if (this.$refs.verifyForm.validate()) {
        try {
          this.overlay = true;
          await this.confirmationResult.confirm(this.verifyNumber);
          await db
            .collection("profiles")
            .doc(firebase.auth().currentUser.uid)
            .set({
              name: self.name,
              imageURL: self.imageURLSafe,
              superLeft: 3,
              description: self.description,
              votes: []
            });

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

<style scoped>
.dropbox {
  outline-offset: -10px;
  color: dimgray;
  padding: 10px 10px;
  height: 80px; /* minimum height */
  position: relative;
  cursor: pointer;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  top: 0px;
  left: 0px;
  height: 80px;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 10px 0;
}
</style>
