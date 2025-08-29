// Firebase configuration
const firebaseConfig = {
  apiKey: "", // No hay clave de API web para este proyecto
  authDomain: "cashtrack-864b9.firebaseapp.com",
  projectId: "cashtrack-864b9",
  storageBucket: "cashtrack-864b9.appspot.com",
  messagingSenderId: "855575147795",
  appId: "cashtrack-864b9",
  databaseURL: "https://cashtrack-864b9-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.database();

// Firebase services are now available globally as auth and db