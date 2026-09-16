import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Test from '@/models/Test';
import Admission from '@/models/Admission';
import { verifyStudentToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('studentToken')?.value;
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = await verifyStudentToken(token);
    
    if (!decoded.success || !decoded.student) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    await connectDB();

    // Get student
    const student = await Admission.findById(decoded.student._id);
    if (!student) {
      return NextResponse.json({
        success: false,
        message: 'Student not found'
      }, { status: 404 });
    }

    // Get all tests for this student's standard that have results
    // Include PUBLISHED and EXPIRED tests since students may have submitted to them
    const tests = await Test.find({
      standard: student.standard,
      'results.0': { $exists: true } // Tests with at least one result
    }).sort({ endDate: -1 });

    // Extract results for this student
    const results = tests.map(test => {
      const studentResult = test.results?.find(
        (r: any) => r.studentId?.toString() === student._id.toString()
      );

      if (!studentResult) return null;

      return {
        testId: test.testId,
        title: test.title,
        subject: test.subject,
        marksObtained: studentResult?.marksObtained || 0,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        status: studentResult?.status || 'Pending',
        submittedAt: studentResult?.submittedAt,
        endDate: test.endDate
      };
    }).filter(r => r !== null); // Only show tests the student attempted

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error: any) {
    console.error('Test Results Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching test results'
    }, { status: 500 });
  }
}
