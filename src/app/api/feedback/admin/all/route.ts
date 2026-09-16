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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const totalCount = await Feedback.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const feedback = await Feedback.find(query)
      .populate('studentId', 'studentName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages
        }
      }
    });

  } catch (error: any) {
    console.error('Get Feedbacks Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching feedbacks'
    }, { status: 500 });
  }
}
