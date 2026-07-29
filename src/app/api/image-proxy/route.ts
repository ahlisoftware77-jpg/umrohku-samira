import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Proxy API for WebGL CORS
 * Fetches images from external URLs (Cloudinary) and serves them with CORS headers.
 * This allows WebGL canvas (circular-gallery.tsx) to load cross-origin images.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Security: Only allow Cloudinary and known safe domains
  const allowedHosts = ['res.cloudinary.com', 'images.unsplash.com', 'picsum.photos'];
  try {
    const parsedUrl = new URL(url);
    if (!allowedHosts.some(h => parsedUrl.hostname === h || parsedUrl.hostname.endsWith('.' + h))) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UmrohkuBot/1.0)',
      },
      cache: 'force-cache',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
