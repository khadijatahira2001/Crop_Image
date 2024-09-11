// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtOYsuvvx9JX1HXerlUz4JJSZ9GqwimmE",
  authDomain: "crop-image-app.firebaseapp.com",
  databaseURL: "https://crop-image-app-default-rtdb.firebaseio.com",
  projectId: "crop-image-app",
  storageBucket: "crop-image-app.appspot.com",
  messagingSenderId: "839575481074",
  appId: "1:839575481074:web:0eb9d053eb891fc746be6b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("App initialized", app.name);
const db = getFirestore(app);
console.log("Database initialized", db);
const storage = getStorage(app);
console.log("Storage initialized", storage);

export {app,db,storage}
