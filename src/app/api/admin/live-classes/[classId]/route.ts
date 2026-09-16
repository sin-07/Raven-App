import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import LiveClass from '@/models/LiveClass';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
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
    const { classId } = await params;
    const body = await request.json();

    const liveClass = await LiveClass.findOneAndUpdate(
      { classId },
      body,
      { new: true }
    );

    if (!liveClass) {
      return NextResponse.json({
        success: false,
        message: 'Live class not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Live class updated successfully',
      data: liveClass
    });

  } catch (error: any) {
    console.error('Update Live Class Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error updating live class'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
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
    const { classId } = await params;

    const liveClass = await LiveClass.findOneAndDelete({ classId });

    if (!liveClass) {
      return NextResponse.json({
        success: false,
        message: 'Live class not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Live class deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete Live Class Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error deleting live class'
    }, { status: 500 });
  }
}
