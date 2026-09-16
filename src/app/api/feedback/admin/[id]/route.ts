import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Feedback from '@/models/Feedback';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(
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
    const body = await request.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.adminResponse) {
      updateData.adminResponse = body.adminResponse;
      updateData.respondedAt = new Date();
    }

    const feedback = await Feedback.findByIdAndUpdate(id, updateData, { new: true });

    if (!feedback) {
      return NextResponse.json({
        success: false,
        message: 'Feedback not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });

  } catch (error: any) {
    console.error('Update Feedback Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error updating feedback'
    }, { status: 500 });
  }
}

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

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return NextResponse.json({
        success: false,
        message: 'Feedback not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete Feedback Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error deleting feedback'
    }, { status: 500 });
  }
}
