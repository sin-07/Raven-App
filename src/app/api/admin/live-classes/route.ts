import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import LiveClass from '@/models/LiveClass';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

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
    const status = searchParams.get('status');
    const className = searchParams.get('class');

    const query: { status?: string; class?: string } = {};
    
    if (status) query.status = status;
    if (className) query.class = className;

    const liveClasses = await LiveClass.find(query).sort({ scheduledDate: -1, startTime: -1 });

    return NextResponse.json({
      success: true,
      data: liveClasses
    });

  } catch (error: any) {
    console.error('Get Live Classes Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching live classes'
    }, { status: 500 });
  }
}

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

    const body = await request.json();
    const { title, description, subject, class: className, scheduledDate, startTime, endTime, duration, maxParticipants, isRecordingEnabled } = body;

    if (!title || !subject || !className || !scheduledDate || !startTime || !endTime) {
      return NextResponse.json({
        success: false,
        message: 'Please fill all required fields'
      }, { status: 400 });
    }

    // Generate unique class ID for Jitsi
    const classId = uuidv4();

    const liveClass = await LiveClass.create({
      classId,
      title,
      description,
      subject,
      class: className,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      duration,
      maxParticipants: maxParticipants || 100,
      isRecordingEnabled: isRecordingEnabled || false,
      status: 'Scheduled'
    });

    return NextResponse.json({
      success: true,
      message: 'Live class created successfully',
      data: liveClass
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create Live Class Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error creating live class'
    }, { status: 500 });
  }
}
