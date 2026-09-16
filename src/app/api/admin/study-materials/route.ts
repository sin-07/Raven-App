import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import StudyMaterial from '@/models/StudyMaterial';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');
    const subject = searchParams.get('subject');

    const query: { class?: string; subject?: string } = {};
    
    if (className) query.class = className;
    if (subject) query.subject = subject;

    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: materials
    });

  } catch (error: any) {
    console.error('Get Study Materials Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching study materials'
    }, { status: 500 });
  }
}
