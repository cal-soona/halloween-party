import { firebase } from "@firebase/app";
import "@firebase/firestore";
import fireBaseConfig from "../firebase.config";

const firebaseApp = firebase.initializeApp(fireBaseConfig);

export const db = firebaseApp.firestore();
