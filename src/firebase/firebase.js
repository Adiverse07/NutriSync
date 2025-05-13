// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAglF5bTl_XC_eoZTZzaCrAweLgQTqm0vE",
  authDomain: "webtechmp-74455.firebaseapp.com",
  projectId: "webtechmp-74455",
  storageBucket: "webtechmp-74455.appspot.com",
  messagingSenderId: "208847231904",
  appId: "1:208847231904:web:bd9ef10bdd4a4b2c90e2c5",
  measurementId: "G-PYM7BCLP3V",
};

// Initialize Firebase
const app       = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth      = getAuth(app);
const db        = getFirestore(app);

export { app, auth, db, analytics };
