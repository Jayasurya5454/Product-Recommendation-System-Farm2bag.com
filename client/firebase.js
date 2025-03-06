import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD4fOcNz77rqdsgC-qVSKNO1yt26V-3IkA",
  authDomain: "farm2bag-recommendation.firebaseapp.com",
  projectId: "farm2bag-recommendation",
  storageBucket: "farm2bag-recommendation.firebasestorage.app",
  messagingSenderId: "615718121059",
  appId: "1:615718121059:web:c2badb3c5bf6e6dc0b1256",
  measurementId: "G-522D9BY5Z7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider(); 

export { auth, googleProvider };