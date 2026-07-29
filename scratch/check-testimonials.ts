import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCfkOcMFkFCHvArDqKKOPRkKYFqJu7aBrM",
  authDomain: "landing-umroh.firebaseapp.com",
  projectId: "landing-umroh",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("=== CHECKING TESTIMONIALS IN FIRESTORE ===");
  const testiSnap = await getDocs(collection(db, 'testimonials'));
  console.log(`Found ${testiSnap.size} testimonials.`);
  testiSnap.docs.forEach(d => {
    console.log(d.id, d.data());
  });
}

check().catch(console.error);
