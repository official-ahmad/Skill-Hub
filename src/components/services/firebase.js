import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_YewrY00DGHu-biED3r1QK72Ez2KRn5Q",
  authDomain: "skillhub-ec2ce.firebaseapp.com",
  projectId: "skillhub-ec2ce",
  storageBucket: "skillhub-ec2ce.firebasestorage.app",
  messagingSenderId: "967612318769",
  appId: "1:967612318769:web:a9ba65865bdf26a2d28110",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
