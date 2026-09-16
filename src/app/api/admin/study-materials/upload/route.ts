import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import StudyMaterial from '@/models/StudyMaterial';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = await verifyAdminToken(token);
    if (!decoded.success || !decoded.admin) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const className = formData.get('class') as string;
    const subject = formData.get('subject') as string;
    const file = formData.get('file') as File;

    if (!title || !className || !subject || !file) {
      return NextResponse.json({
        success: false,
        message: 'Please fill all required fields'
      }, { status: 400 });
    }

    // Convert file to buffer and upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'study-materials',
          public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const material = await StudyMaterial.create({
      title,
      description,
      class: className,
      subject,
      fileUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      fileSize: file.size
    });

    return NextResponse.json({
      success: true,
      message: 'Study material uploaded successfully',
      data: material
    }, { status: 201 });

  } catch (error: any) {
    console.error('Upload Study Material Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error uploading study material'
    }, { status: 500 });
  }
}
