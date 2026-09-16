import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/database';
import Course from '@/models/Course';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify admin token
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

// PATCH - Toggle publish status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const { isPublished } = body;

    const course = await Course.findByIdAndUpdate(
      id,
      { isPublished, updatedAt: new Date() },
      { new: true }
    );

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isPublished ? 'Course published' : 'Course unpublished',
      course,
    });
  } catch (error) {
    console.error('Error updating publish status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update course' },
      { status: 500 }
    );
  }
}
