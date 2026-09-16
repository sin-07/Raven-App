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

// GET - Fetch single course
export async function GET(
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
    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT - Update course
export async function PUT(
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

    const course = await Course.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(
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
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
