// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDHstP2TpgQObVUKQYaWfv7TVw5ik11cIY",
  authDomain: "nadjar-web.firebaseapp.com",
  projectId: "nadjar-web",
  storageBucket: "nadjar-web.firebasestorage.app",
  messagingSenderId: "109569155109",
  appId: "1:109569155109:web:7317c47de020c26d545fcc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("Firebase initialized for index page");
