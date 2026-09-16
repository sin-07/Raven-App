import { NextRequest, NextResponse } from 'next/server';
import Admission from '@/models/Admission';
import { authenticateStudent } from '@/lib/apiMiddleware';

// GET - Get student's enrolled courses
export async function GET() {
  try {
    const { student: authStudent, error } = await authenticateStudent();
    if (error || !authStudent) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const student = await Admission.findOne({
      registrationId: authStudent.registrationId,
    })
      .select('registrationId studentName standard enrolledCourses')
      .lean();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        registrationId: student.registrationId,
        studentName: student.studentName,
        standard: student.standard,
        enrolledCourses: student.enrolledCourses || [],
      },
    });
  } catch (error: any) {
    console.error('Get enrolled courses error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}

// POST - Enroll in crash course
export async function POST(request: NextRequest) {
  try {
    const { student: authStudent, error } = await authenticateStudent();
    if (error || !authStudent) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { subject } = await request.json();

    if (!subject) {
      return NextResponse.json({ success: false, message: 'Subject is required' }, { status: 400 });
    }

    const student = await Admission.findOne({
      registrationId: authStudent.registrationId,
    });

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    // Check if already enrolled in this crash course
    const alreadyEnrolled = student.enrolledCourses?.some(
      (course: any) =>
        course.courseType === 'crash' &&
        course.subject === subject &&
        course.standard === student.standard
    );

    if (alreadyEnrolled) {
      return NextResponse.json(
        { success: false, message: 'Already enrolled in this crash course' },
        { status: 400 }
      );
    }

    // Add crash course enrollment
    if (!student.enrolledCourses) {
      student.enrolledCourses = [];
    }

    student.enrolledCourses.push({
      courseType: 'crash',
      subject,
      standard: student.standard,
      enrolledAt: new Date(),
    });

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in crash course',
      data: {
        enrolledCourses: student.enrolledCourses,
      },
    });
  } catch (error: any) {
    console.error('Enroll crash course error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to enroll in crash course' },
      { status: 500 }
    );
  }
}

