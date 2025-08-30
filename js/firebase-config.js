// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzNN3ccrqgKJtBnff3FbD5MXDbTDr0YWs",
  authDomain: "cashtrack-864b9.firebaseapp.com",
  databaseURL: "https://cashtrack-864b9-default-rtdb.firebaseio.com",
  projectId: "cashtrack-864b9",
  storageBucket: "cashtrack-864b9.appspot.com",
  messagingSenderId: "855575147795",
  appId: "1:855575147795:web:cashtrack-864b9",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  
  // Verificar que los servicios estén disponibles
  if (firebase.auth) {
    console.log('✅ Firebase Auth disponible');
  } else {
    console.error('❌ Firebase Auth no disponible');
  }
  
  if (firebase.database) {
    console.log('✅ Firebase Database disponible');
  } else {
    console.error('❌ Firebase Database no disponible');
  }
  
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
}