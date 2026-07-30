import { z } from 'zod';

// ==========================================
// 1. TENANT SCHEMA
// ==========================================
export const TenantPlanSchema = z.enum(['free', 'basic', 'pro', 'enterprise']);
export type TenantPlan = z.infer<typeof TenantPlanSchema>;

export const TenantStatusSchema = z.enum(['active', 'suspended']);
export type TenantStatus = z.infer<typeof TenantStatusSchema>;

export const TenantLimitsSchema = z.object({
  landingPages: z.number().default(1),
  storageMb: z.number().default(100),
  uploadLimitKb: z.number().default(2048),
  visitorLimit: z.number().default(1000),
});
export type TenantLimits = z.infer<typeof TenantLimitsSchema>;

export const TenantSchema = z.object({
  tenantId: z.string(),
  readableId: z.string().optional(),
  name: z.string(),
  company: z.string(),
  email: z.string().email(),
  plan: TenantPlanSchema.default('free'),
  status: TenantStatusSchema.default('active'),
  createdAt: z.any(), // Firebase Timestamp
  customDomain: z.string().optional(),
  subdomain: z.string(),
  dbServerId: z.string().optional(),
  limits: TenantLimitsSchema,
});
export type Tenant = z.infer<typeof TenantSchema>;

export interface DatabaseServerConfig {
  serverId: string;
  name: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  status: 'active' | 'full' | 'maintenance';
  isDefault?: boolean;
  createdAt?: any;
}

export interface TestimonialItem {
  testimonialId: string;
  tenantId: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatarUrl?: string;
  status: 'approved' | 'pending' | 'archived';
  createdAt: any;
}

// ==========================================
// 2. LANDING PAGE SCHEMA
// ==========================================
export const PageStatusSchema = z.enum(['draft', 'published', 'scheduled', 'archived']);
export type PageStatus = z.infer<typeof PageStatusSchema>;

export const PageSeoSchema = z.object({
  title: z.string().default('Samira Travel'),
  description: z.string().default('Perjalanan Umroh Nyaman'),
  keywords: z.array(z.string()).default([]),
  canonicalUrl: z.string().optional(),
  ogImage: z.string().optional(),
  schemaJsonLd: z.string().optional(),
});
export type PageSeo = z.infer<typeof PageSeoSchema>;

export const ThemeSchema = z.object({
  primaryColor: z.string().default('#0A1E3B'),   // Samira Navy
  secondaryColor: z.string().default('#D4AF37'), // Samira Gold
  fontFamily: z.string().default('PT Sans'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('lg'),
  shadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('lg'),
  spacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
  containerWidth: z.enum(['md', 'lg', 'xl', 'full']).default('xl'),
  darkMode: z.boolean().default(false),
});
export type ThemeConfig = z.infer<typeof ThemeSchema>;

export const GlobalSettingsSchema = z.object({
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  whatsappNumber: z.string().optional(),
  emailContact: z.string().optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
  }).default({}),
});
export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

export const LandingPageSchema = z.object({
  pageId: z.string(),
  tenantId: z.string(),
  title: z.string(),
  slug: z.string().default('home'),
  status: PageStatusSchema.default('draft'),
  publishTime: z.any().optional(),
  seo: PageSeoSchema,
  theme: ThemeSchema,
  globalSettings: GlobalSettingsSchema,
  createdAt: z.any(),
  updatedAt: z.any(),
});
export type LandingPage = z.infer<typeof LandingPageSchema>;

// ==========================================
// 3. SECTION SCHEMA
// ==========================================
export const SectionTypeSchema = z.enum([
  'hero',
  'about',
  'feature',
  'service',
  'gallery',
  'portfolio',
  'katalog',
  'catalog',
  'pricing',
  'faq',
  'testimonial',
  'cta',
  'contact',
  'footer',
  'why_umrah',
  'why_samira',
  'finance',
  'muri',
  'flow',
  'social_media'
]);
export type SectionType = z.infer<typeof SectionTypeSchema>;

export const SectionSchema = z.object({
  sectionId: z.string(),
  tenantId: z.string(),
  landingPageId: z.string(),
  type: SectionTypeSchema,
  order: z.number(),
  isHidden: z.boolean().default(false),
});
export type Section = z.infer<typeof SectionSchema>;

// ==========================================
// 4. CONTENT SCHEMA
// ==========================================
export const ContentSchema = z.object({
  contentId: z.string(),
  tenantId: z.string(),
  sectionId: z.string(),
  key: z.string(),
  value: z.any(),
});
export type Content = z.infer<typeof ContentSchema>;

// ==========================================
// 5. IMAGE/MEDIA SCHEMA
// ==========================================
export const MediaImageSchema = z.object({
  imageId: z.string(),
  tenantId: z.string(),
  cloudinaryPublicId: z.string(),
  secureUrl: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
  sizeBytes: z.number(),
  folder: z.string(),
  category: z.string().optional(),
  createdAt: z.any(),
});
export type MediaImage = z.infer<typeof MediaImageSchema>;

// ==========================================
// 6. FORM BUILDER SCHEMA
// ==========================================
export const FieldTypeSchema = z.enum([
  'text',
  'email',
  'phone',
  'textarea',
  'checkbox',
  'radio',
  'select',
  'date',
  'file'
]);
export type FieldType = z.infer<typeof FieldTypeSchema>;

export const FormFieldSchema = z.object({
  id: z.string(),
  type: FieldTypeSchema,
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const FormSchema = z.object({
  formId: z.string(),
  tenantId: z.string(),
  landingPageId: z.string(),
  title: z.string(),
  fields: z.array(FormFieldSchema),
});
export type Form = z.infer<typeof FormSchema>;

export const FormSubmissionSchema = z.object({
  submissionId: z.string(),
  tenantId: z.string(),
  formId: z.string(),
  data: z.record(z.any()),
  submittedAt: z.any(),
});
export type FormSubmission = z.infer<typeof FormSubmissionSchema>;

// ==========================================
// 7. ROLE SCHEMA
// ==========================================
export const UserRoleSchema = z.enum(['super_admin', 'owner', 'admin', 'editor', 'viewer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  createdAt: z.any(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// ==========================================
// 8. REVISION SCHEMA
// ==========================================
export const PageRevisionSchema = z.object({
  revisionId: z.string(),
  tenantId: z.string(),
  landingPageId: z.string(),
  dataJson: z.string(), // Serialized sections & contents
  createdAt: z.any(),
  createdBy: z.string(),
});
export type PageRevision = z.infer<typeof PageRevisionSchema>;

// ==========================================
// 9. ANALYTICS SCHEMA
// ==========================================
export const AnalyticsEventSchema = z.object({
  eventId: z.string(),
  tenantId: z.string(),
  landingPageId: z.string().optional(),
  type: z.enum(['page_view', 'form_submission', 'whatsapp_click']),
  visitorId: z.string(),
  isUnique: z.boolean(),
  campaign: z.string().optional(),
  referrer: z.string().optional(),
  createdAt: z.any(),
});
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// ==========================================
// 10. PACKAGE SCHEMAS
// ==========================================
export const PackageLimitsSchema = z.object({
  landingPages: z.number(),
  storageMb: z.number(),
  uploadLimitKb: z.number(),
  domainEnabled: z.boolean(),
  visitorLimit: z.number(),
});
export type PackageLimits = z.infer<typeof PackageLimitsSchema>;

export const SystemPlanSchema = z.object({
  planId: TenantPlanSchema,
  name: z.string(),
  priceMonthly: z.number(),
  limits: PackageLimitsSchema,
});
export type SystemPlan = z.infer<typeof SystemPlanSchema>;

export const SYSTEM_PLANS: Record<TenantPlan, SystemPlan> = {
  free: {
    planId: 'free',
    name: 'Free Plan',
    priceMonthly: 0,
    limits: {
      landingPages: 1,
      storageMb: 50,
      uploadLimitKb: 1024,
      domainEnabled: false,
      visitorLimit: 500,
    },
  },
  basic: {
    planId: 'basic',
    name: 'Basic Plan',
    priceMonthly: 150000,
    limits: {
      landingPages: 3,
      storageMb: 250,
      uploadLimitKb: 2048,
      domainEnabled: true,
      visitorLimit: 5000,
    },
  },
  pro: {
    planId: 'pro',
    name: 'Pro Plan',
    priceMonthly: 350000,
    limits: {
      landingPages: 10,
      storageMb: 1024,
      uploadLimitKb: 5120,
      domainEnabled: true,
      visitorLimit: 25000,
    },
  },
  enterprise: {
    planId: 'enterprise',
    name: 'Enterprise Plan',
    priceMonthly: 1000000,
    limits: {
      landingPages: 99,
      storageMb: 10240,
      uploadLimitKb: 10240,
      domainEnabled: true,
      visitorLimit: 250000,
    },
  },
};

export interface BuilderPlan {
  planId: string;
  name: string;
  badge: string;
  price: string;
  period: string;
  isPopular?: boolean;
  description: string;
  features: string[];
  order: number;
}
