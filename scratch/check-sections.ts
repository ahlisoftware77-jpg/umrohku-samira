import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCfkOcMFkFCHvArDqKKOPRkKYFqJu7aBrM",
  authDomain: "landing-umroh.firebaseapp.com",
  projectId: "landing-umroh",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("=== CHECKING SECTIONS FOR DEFAULT/MAIN PAGE ===");
  
  // 1. Get tenants
  const tSnap = await getDocs(collection(db, 'tenants'));
  console.log("\n[TENANTS]");
  tSnap.docs.forEach(d => console.log(`ID: ${d.id}, Subdomain: ${d.data().subdomain}, TenantId: ${d.data().tenantId}`));

  // 2. Get landingPages
  const lpSnap = await getDocs(collection(db, 'landingPages'));
  console.log("\n[LANDING PAGES]");
  lpSnap.docs.forEach(d => console.log(`ID: ${d.id}, TenantId: ${d.data().tenantId}, Slug: ${d.data().slug}`));

  // 3. Get all sections
  const secSnap = await getDocs(collection(db, 'sections'));
  console.log("\n[ALL SECTIONS]");
  secSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`ID: ${d.id}, landingPageId: ${data.landingPageId}, Type: ${data.type}, Order: ${data.order}, IsHidden: ${data.isHidden}`);
  });
}

check().catch(console.error);
