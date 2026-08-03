import { doc, setDoc, deleteDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MediaImage } from '@/types/cms';

export const cloudinaryService = {
  // Get cached or stored Cloudinary credentials (saves Firebase reads if cached)
  async getCloudinaryConfig() {
    let cloudName = typeof window !== 'undefined' ? localStorage.getItem('cld_cloud_name') : null;
    let uploadPreset = typeof window !== 'undefined' ? localStorage.getItem('cld_upload_preset') : null;
    let apiKey = typeof window !== 'undefined' ? localStorage.getItem('cld_api_key') : null;

    // If missing in localStorage, try fetching from Firestore (Super Admin settings)
    if (!cloudName || !uploadPreset) {
      try {
        const snap = await getDoc(doc(db, 'systemSettings', 'global'));
        if (snap.exists()) {
          const data = snap.data();
          if (data?.cloudinary) {
            cloudName = data.cloudinary.cloudName || cloudName;
            uploadPreset = data.cloudinary.uploadPreset || uploadPreset;
            
            // Cache to local storage to avoid repeated reads
            if (typeof window !== 'undefined') {
              if (cloudName) localStorage.setItem('cld_cloud_name', cloudName);
              if (uploadPreset) localStorage.setItem('cld_upload_preset', uploadPreset);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch Cloudinary config from Firestore:', err);
      }
    }

    // Fallbacks to env or default
    cloudName = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'landing-umroh';
    uploadPreset = uploadPreset || 'ml_default';
    apiKey = apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';

    return { 
      cloudName: cloudName.trim(), 
      uploadPreset: uploadPreset.trim(),
      apiKey: apiKey.trim()
    };
  },

  // ==========================================
  // UNSIGNED CLIENT SIDE UPLOAD (No API Key/Secret / No .env needed)
  // ==========================================
  async uploadImage(
    tenantId: string,
    file: File,
    customCloudName?: string,
    customUploadPreset?: string,
    category?: string
  ): Promise<MediaImage> {
    const { cloudName: defaultCloudName, uploadPreset: defaultUploadPreset, apiKey } = await this.getCloudinaryConfig();
    const cloudName = (customCloudName || defaultCloudName).trim();
    const uploadPreset = (customUploadPreset || defaultUploadPreset).trim();

    // 0. Duplicate Image Detection: Check if exact same file size & tenant already exists to skip re-uploading
    try {
      const qDup = query(
        collection(db, 'images'),
        where('tenantId', '==', tenantId),
        where('sizeBytes', '==', file.size)
      );
      const dupSnap = await getDocs(qDup);
      if (!dupSnap.empty) {
        const existing = dupSnap.docs[0].data() as MediaImage;
        if (existing && existing.secureUrl) {
          console.log('⚡ [DUPLICATE DETECTED] Gambar duplikat terdeteksi! Menggunakan kembali URL terunggah:', existing.secureUrl);
          if (category && existing.category !== category) {
            const docId = existing.imageId || dupSnap.docs[0].id;
            await setDoc(doc(db, 'images', docId), { category }, { merge: true }).catch(() => {});
            existing.category = category;
          }
          return existing;
        }
      }
    } catch (dupErr) {}

    const folder = `tenant/${tenantId}`;
    const isCustomCloudName = cloudName && cloudName !== 'landing-umroh';
    
    // 1. Try Direct Unsigned Upload to Cloudinary only if custom credentials configured
    if (isCustomCloudName) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);
        if (apiKey) {
          formData.append('api_key', apiKey);
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          const imageId = `img_${uploadData.public_id.replace(/\//g, '_')}`;
          const mediaImage: MediaImage = {
            imageId,
            tenantId,
            cloudinaryPublicId: uploadData.public_id,
            secureUrl: uploadData.secure_url,
            width: uploadData.width,
            height: uploadData.height,
            format: uploadData.format,
            sizeBytes: uploadData.bytes,
            folder,
            category: category || 'general',
            createdAt: new Date().toISOString(),
          };

          await setDoc(doc(db, 'images', imageId), mediaImage);
          return mediaImage;
        }
      } catch (cldErr) {
        console.warn('Cloudinary upload fallback activated:', cldErr);
      }
    }

    // 2. Fail-safe Fallback: Convert file to Data URL and save to Firestore
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const fallbackImageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mediaImage: MediaImage = {
      imageId: fallbackImageId,
      tenantId,
      cloudinaryPublicId: `local_${Date.now()}`,
      secureUrl: dataUrl,
      width: 800,
      height: 600,
      format: file.type.split('/')[1] || 'jpeg',
      sizeBytes: file.size,
      folder,
      category: category || 'general',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'images', fallbackImageId), mediaImage);
    return mediaImage;
  },

  // ==========================================
  // REMOVE IMAGE (MULTI-DATABASE SYNC)
  // ==========================================
  async deleteImage(imageId: string, _cloudinaryPublicId?: string, secureUrl?: string, targetDbInstance?: any): Promise<void> {
    const targetDb = targetDbInstance || db;
    if (!imageId && !secureUrl) return;

    try {
      // 1. Delete by exact document ID across targetDb and Primary DB
      if (imageId && typeof imageId === 'string' && imageId.trim() !== '') {
        await deleteDoc(doc(targetDb, 'images', imageId)).catch(() => {});
        if (targetDb !== db) {
          await deleteDoc(doc(db, 'images', imageId)).catch(() => {});
        }
      }

      // 2. Fallback query deletion by secureUrl to remove matching document entries
      if (secureUrl) {
        const dbs = targetDb !== db ? [targetDb, db] : [db];
        for (const dbInst of dbs) {
          try {
            const imagesRef = collection(dbInst, 'images');
            const qUrl = query(imagesRef, where('secureUrl', '==', secureUrl));
            const snapUrl = await getDocs(qUrl);
            for (const d of snapUrl.docs) {
              await deleteDoc(doc(dbInst, 'images', d.id)).catch(() => {});
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Error executing deleteImage:', err);
    }
  }
};

export default cloudinaryService;
