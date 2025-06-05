import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM4TznP-hZOmW_gqz4sTrTK21nAz-gbr8",
  authDomain: "tis-pm.firebaseapp.com",
  projectId: "tis-pm",
  storageBucket: "tis-pm.appspot.com",
  messagingSenderId: "389407133000",
  appId: "1:389407133000:web:b7accc66dee91796b8777d"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
