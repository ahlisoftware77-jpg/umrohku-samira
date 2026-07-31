import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/types/cms';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: string | null;
  tenantId: string | null;
}

export const useAuthHandler = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const readableId = firebaseUser.email 
          ? firebaseUser.email.toLowerCase().replace(/[^a-z0-9]/g, '_') 
          : firebaseUser.uid;
          
        const readableRef = doc(db, 'users', readableId);
        const uidRef = doc(db, 'users', firebaseUser.uid);
        const isSuperAdminEmail = firebaseUser.email === 'triyadi72@gmail.com';
        const defaultRole = isSuperAdminEmail ? 'super_admin' : 'owner';

        try {
          let profileSnap = await getDoc(readableRef);
          if (!profileSnap.exists()) {
            profileSnap = await getDoc(uidRef);
          }
          
          if (profileSnap.exists()) {
            const data = profileSnap.data() as UserProfile;
            if (isSuperAdminEmail && data.role !== 'super_admin') {
              data.role = 'super_admin';
              try { 
                await updateDoc(readableRef, { role: 'super_admin' }); 
                await updateDoc(uidRef, { role: 'super_admin' }); 
              } catch (uErr) {}
            }
            setProfile(data);
          } else {
            const defaultProfile: UserProfile = {
              userId: firebaseUser.uid,
              tenantId: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: defaultRole,
              createdAt: new Date().toISOString(),
            };

            const defaultTenant = {
              tenantId: firebaseUser.uid,
              readableId,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Mitra',
              company: 'Travel Umrah',
              email: firebaseUser.email || '',
              plan: 'free',
              status: 'active',
              subdomain: readableId,
              limits: {
                landingPages: 1,
                storageMb: 50,
                uploadLimitKb: 2048,
                visitorLimit: 10000,
              },
              createdAt: new Date().toISOString(),
            };

            try {
              // Primary UID document writes
              await setDoc(uidRef, defaultProfile);
              await setDoc(doc(db, 'tenants', firebaseUser.uid), defaultTenant);
            } catch (sErr) {
              console.log('Auto-creating UID profile fallback:', sErr);
            }
            setProfile(defaultProfile);
          }
        } catch (error) {
          // Fail-Safe Fallback: Set valid user profile in memory so dashboard works seamlessly
          const fallbackProfile: UserProfile = {
            userId: firebaseUser.uid,
            tenantId: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: defaultRole,
            createdAt: new Date(),
          };
          setProfile(fallbackProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    role: profile?.role || null,
    tenantId: profile?.tenantId || null,
  };
};
