import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCfkOcMFkFCHvArDqKKOPRkKYFqJu7aBrM",
  authDomain: "landing-umroh.firebaseapp.com",
  projectId: "landing-umroh",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const docSnap = await getDoc(doc(db, 'tenants', 'default'));
  if (docSnap.exists()) {
    console.log("DEFAULT TENANT:", docSnap.data());
  } else {
    console.log("No default tenant document!");
  }
}

check().catch(console.error);
