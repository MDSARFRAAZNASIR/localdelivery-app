// Import the functions you need from the SDKs you need
// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6Wiy8TwOCcznIc9O1N2bEzFSo5dlnXNQ",
  authDomain: "local-delhivery.firebaseapp.com",
  projectId: "local-delhivery",
  storageBucket: "local-delhivery.firebasestorage.app",
  messagingSenderId: "555093562268",
  appId: "1:555093562268:web:8937d8be3fd8c8eb2aae59",
  measurementId: "G-NYT23JD0ZQ"
};





// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Messaging and export it
export const messaging = getMessaging(app);