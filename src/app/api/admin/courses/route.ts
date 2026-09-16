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

// GET - Fetch all courses
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const courses = await Course.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create new course
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const {
      title,
      description,
      instructor,
      instructorQualification,
      instructorAvatar,
      duration,
      level,
      category,
      price,
      originalPrice,
      thumbnail,
      syllabus,
      features,
    } = body;

    // Validate required fields
    if (!title || !description || !instructor || !duration || !level || !category || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const course = new Course({
      title,
      description,
      instructor,
      instructorQualification: instructorQualification || '',
      instructorAvatar: instructorAvatar || '',
      duration,
      level,
      category,
      price,
      originalPrice: originalPrice || price,
      thumbnail: thumbnail || '',
      syllabus: syllabus || [],
      features: features || [],
      isPublished: false,
      enrolledStudents: 0,
      rating: 0,
      totalRatings: 0,
    });

    await course.save();

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create course' },
      { status: 500 }
    );
  }
}
