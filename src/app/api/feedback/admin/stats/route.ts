import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Feedback from '@/models/Feedback';
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

    const total = await Feedback.countDocuments();
    const newCount = await Feedback.countDocuments({ status: 'new' });
    const reviewed = await Feedback.countDocuments({ status: 'reviewed' });
    const resolved = await Feedback.countDocuments({ status: 'resolved' });

    return NextResponse.json({
      success: true,
      data: {
        total,
        new: newCount,
        reviewed,
        resolved
      }
    });

  } catch (error: any) {
    console.error('Get Feedback Stats Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching feedback stats'
    }, { status: 500 });
  }
}
