import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { paramsToSign } = await request.json();

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary API Secret is not configured in environment variables.' },
        { status: 500 }
      );
    }

    // Sort parameters alphabetically as required by Cloudinary
    const sortedKeys = Object.keys(paramsToSign).sort();
    const parameterString = sortedKeys
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');

    // Generate SHA-1 hash signature
    const signature = crypto
      .createHash('sha1')
      .update(parameterString + apiSecret)
      .digest('hex');

    return NextResponse.json({
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error: any) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json({ error: error.message || 'Signature failure' }, { status: 500 });
  }
}
