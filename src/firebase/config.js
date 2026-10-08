import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBwvkpkIaXTz1hIYxU-RZkI_fa-p3pqQf4",
    authDomain: "gaspay-ba976.firebaseapp.com",
    projectId: "gaspay-ba976",
    storageBucket: "gaspay-ba976.firebasestorage.app",
    messagingSenderId: "558498317145",
    appId: "1:558498317145:web:460287e924ff695256c248"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;