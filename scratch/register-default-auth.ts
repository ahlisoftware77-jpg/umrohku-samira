import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCfkOcMFkFCHvArDqKKOPRkKYFqJu7aBrM",
  authDomain: "landing-umroh.firebaseapp.com",
  projectId: "landing-umroh",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
  const email = "triyadi@gmail.com";
  const defaultPassword = "password123";

  console.log(`Checking/registering default user: ${email}...`);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, defaultPassword);
    console.log(`✅ SUCCESS: Created Firebase Auth user for ${email} with password: "${defaultPassword}"`);
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`ℹ️ Email ${email} is already in use. Attempting to update password to "${defaultPassword}"...`);
      try {
        // Try standard passwords to log in first and reset it
        const commonPasswords = ["password123", "123456", "samira123"];
        let loggedIn = false;
        for (const p of commonPasswords) {
          try {
            const cred = await signInWithEmailAndPassword(auth, email, p);
            console.log(`✅ Success: Signed in with password "${p}"`);
            await updatePassword(cred.user, defaultPassword);
            console.log(`✅ Success: Updated password to "${defaultPassword}"`);
            loggedIn = true;
            break;
          } catch (e) {
            // try next
          }
        }
        if (!loggedIn) {
          console.log(`⚠️ Could not log in using common passwords. Please reset it from Firebase Console or use your own custom registered tenant.`);
        }
      } catch (pwErr: any) {
        console.error("Failed to update password:", pwErr.message);
      }
    } else {
      console.error("Error:", err.message);
    }
  }
}

run().catch(console.error);
