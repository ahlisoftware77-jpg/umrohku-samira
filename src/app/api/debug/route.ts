import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    let tQ, iQ, cQ, pQ, sQ;
    if (tenantId) {
      tQ = query(collection(db, 'tenants'), where('tenantId', '==', tenantId));
      iQ = query(collection(db, 'images'), where('tenantId', '==', tenantId));
      cQ = query(collection(db, 'contents'), where('tenantId', '==', tenantId));
      pQ = query(collection(db, 'landingPages'), where('tenantId', '==', tenantId));
      sQ = query(collection(db, 'sections'), where('tenantId', '==', tenantId));
    } else {
      tQ = query(collection(db, 'tenants'));
      iQ = query(collection(db, 'images'));
      cQ = query(collection(db, 'contents'));
      pQ = query(collection(db, 'landingPages'));
      sQ = query(collection(db, 'sections'));
    }

    const tenantsSnap = await getDocs(tQ);
    const tenants = tenantsSnap.docs.map(d => d.data());

    const imagesSnap = await getDocs(iQ);
    const images = imagesSnap.docs.map(d => d.data());

    const contentsSnap = await getDocs(cQ);
    const contents = contentsSnap.docs.map(d => d.data());

    const pagesSnap = await getDocs(pQ);
    const landingPages = pagesSnap.docs.map(d => d.data());

    const sectionsSnap = await getDocs(sQ);
    const sections = sectionsSnap.docs.map(d => d.data());

    return NextResponse.json({ tenants, images, contents, landingPages, sections });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
