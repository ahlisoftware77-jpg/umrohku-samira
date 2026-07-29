import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tenant, TenantPlan, TenantStatus, SYSTEM_PLANS } from '@/types/cms';

export const tenantService = {
  // ==========================================
  // GET TENANT DETAILS
  // ==========================================
  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const docRef = doc(db, 'tenants', tenantId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data() as Tenant;
    } catch (err) {
      return null;
    }
  },

  async getTenantByDomainOrSubdomain(host: string): Promise<Tenant | null> {
    try {
      // Check custom domain first
      const qCustom = query(collection(db, 'tenants'), where('customDomain', '==', host));
      const snapCustom = await getDocs(qCustom);
      if (!snapCustom.empty) {
        return snapCustom.docs[0].data() as Tenant;
      }

      // Check subdomain
      const subdomain = host.split('.')[0];
      const qSub = query(collection(db, 'tenants'), where('subdomain', '==', subdomain));
      const snapSub = await getDocs(qSub);
      if (!snapSub.empty) {
        return snapSub.docs[0].data() as Tenant;
      }
    } catch (err) {}

    return null;
  },

  // ==========================================
  // SUPER ADMIN CRUD FOR TENANTS
  // ==========================================
  async createTenant(tenant: Omit<Tenant, 'createdAt'>): Promise<Tenant> {
    const docRef = doc(db, 'tenants', tenant.tenantId);
    const newTenant = {
      ...tenant,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(docRef, newTenant);
    } catch (err) {}
    return newTenant as unknown as Tenant;
  },

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<void> {
    try {
      const docRef = doc(db, 'tenants', tenantId);
      await updateDoc(docRef, updates);
    } catch (err) {}
  },

  async changeStatus(tenantId: string, status: TenantStatus): Promise<void> {
    await this.updateTenant(tenantId, { status });
  },

  async changePlan(tenantId: string, plan: TenantPlan): Promise<void> {
    const planLimits = SYSTEM_PLANS[plan].limits;
    await this.updateTenant(tenantId, {
      plan,
      limits: {
        landingPages: planLimits.landingPages,
        storageMb: planLimits.storageMb,
        uploadLimitKb: planLimits.uploadLimitKb,
        visitorLimit: planLimits.visitorLimit,
      }
    });
  },

  async deleteTenant(tenantId: string): Promise<void> {
    try {
      const docRef = doc(db, 'tenants', tenantId);
      await deleteDoc(docRef);
    } catch (err) {}
  },

  async getAllTenants(): Promise<Tenant[]> {
    try {
      const snap = await getDocs(collection(db, 'tenants'));
      return snap.docs.map(doc => doc.data() as Tenant);
    } catch (err) {
      return [];
    }
  }
};
export default tenantService;
