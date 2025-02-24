import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBb8A9FOHfzjK3nH6EuzkX2vSvEJD3zNg",
  authDomain: "stonks-6456a.firebaseapp.com",
  projectId: "stonks-6456a",
  storageBucket: "stonks-6456a.appspot.com",
  messagingSenderId: "279444038679",
  appId: "1:279444038679:web:76d8518c4b604b1af09c92",
  measurementId: "G-TGKX82S19D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
