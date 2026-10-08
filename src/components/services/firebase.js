//

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2_NbwxfyPCdcMuibYM1ToR56ELZG8nj8",
  authDomain: "skillhub-bsse.firebaseapp.com",
  projectId: "skillhub-bsse",
  storageBucket: "skillhub-bsse.firebasestorage.app",
  messagingSenderId: "274365808734",
  appId: "1:274365808734:web:ac833e04020c654486b4cf",
  measurementId: "G-FLGD9Q9885",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export default firebase;
