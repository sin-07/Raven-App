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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const material = await StudyMaterial.findById(id);

    if (!material) {
      return NextResponse.json({
        success: false,
        message: 'Study material not found'
      }, { status: 404 });
    }

    // Delete from Cloudinary if cloudinaryId exists
    if (material.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(material.cloudinaryId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    await StudyMaterial.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Study material deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete Study Material Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error deleting study material'
    }, { status: 500 });
  }
}
