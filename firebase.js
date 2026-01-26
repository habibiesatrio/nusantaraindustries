import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// IMPORTANT: You need to complete this configuration with your Firebase project details.
// The API key has been pre-filled for you.
const firebaseConfig = {
    apiKey: "AIzaSyDRFCma89qa8DBPDRQ9Vun0ZTaYeZmzRiw",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const rtdb = getDatabase(app);