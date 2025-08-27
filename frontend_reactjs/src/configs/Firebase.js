// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAh1bpnBZ8LqczXIv_2-H5t0gCrw1Wt1tU",
  authDomain: "eemapp-8add6.firebaseapp.com",
  databaseURL: "https://eemapp-8add6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eemapp-8add6",
  storageBucket: "eemapp-8add6.firebasestorage.app",
  messagingSenderId: "991680595490",
  appId: "1:991680595490:web:cd16c22794848325232c7b",
  measurementId: "G-FDS4C66ZYH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);