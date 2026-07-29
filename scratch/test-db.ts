import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  projectId: "samira-travel-8e8e7"
});
const db = getFirestore(app);

async function check() {
  const tSnap = await getDocs(collection(db, 'tenants'));
  console.log("TENANTS:");
  tSnap.docs.forEach(d => console.log(d.id, d.data().subdomain));

  const iSnap = await getDocs(collection(db, 'images'));
  console.log("\nIMAGES:");
  iSnap.docs.forEach(d => console.log(d.data().tenantId, d.data().category, d.data().secureUrl));

  const cSnap = await getDocs(collection(db, 'contents'));
  console.log("\nCONTENTS:");
  cSnap.docs.forEach(d => {
    if (d.data().key === 'galleryImages' || d.data().key === 'images') {
      console.log(d.data().tenantId, d.data().sectionId, d.data().key, d.data().value);
    }
  });
}
check();
