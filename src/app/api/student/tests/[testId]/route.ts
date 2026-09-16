import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Test from '@/models/Test';
import Admission from '@/models/Admission';
import { verifyStudentToken } from '@/lib/auth';

// Helper function to auto-expire tests past their endDate
async function autoExpireTests() {
  const now = new Date();
  await Test.updateMany(
    {
      status: 'PUBLISHED',
      endDate: { $lt: now }
    },
    {
      $set: { status: 'EXPIRED' }
    }
  );
}

// GET - Get single test details for student (to take the test)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const token = request.cookies.get('studentToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyStudentToken(token);
    
    if (!decoded.success || !decoded.student) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { testId } = await params;
    
    await connectDB();
    
    // Auto-expire old tests
    await autoExpireTests();
    
    // Use student from decoded token
    const student = decoded.student;
    
    // Get test and verify it's for student's standard
    const test = await Test.findById(testId)
      .select('testId title description subject standard startDate endDate duration totalMarks passingMarks questions status results');
    
    if (!test) {
      return NextResponse.json(
        { success: false, message: 'Test not found' },
        { status: 404 }
      );
    }
    
    // Verify student's standard matches test standard
    if (test.standard !== student.standard) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to view this test' },
        { status: 403 }
      );
    }
    
    // Check if test is PUBLISHED
    if (test.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, message: 'This test is not available' },
        { status: 403 }
      );
    }
    
    // Check if test is within the valid date range
    const now = new Date();
    const startDate = new Date(test.startDate);
    const endDate = new Date(test.endDate);
    
    if (now < startDate) {
      return NextResponse.json(
        { success: false, message: 'This test is not yet available. It starts on ' + startDate.toLocaleDateString() },
        { status: 403 }
      );
    }
    
    if (now > endDate) {
      return NextResponse.json(
        { success: false, message: 'This test has expired' },
        { status: 403 }
      );
    }
    
    // Check if student has already submitted this test
    const alreadySubmitted = test.results && test.results.some(
      (r: any) => r.studentId && r.studentId.toString() === student._id.toString()
    );
    if (alreadySubmitted) {
      return NextResponse.json(
        { success: false, message: 'You have already submitted this test' },
        { status: 403 }
      );
    }
    
    // Calculate time remaining until end date (useful for client)
    const msRemaining = endDate.getTime() - now.getTime();
    const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
    
    // Remove results field before sending to student
    const testObj = test.toObject();
    delete testObj.results;
    
    return NextResponse.json({
      success: true,
      data: {
        ...testObj,
        timeRemainingUntilExpiry: hoursRemaining + ' hours'
      }
    });
  } catch (error: any) {
    console.error('Get student test error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching test' },
      { status: 500 }
    );
  }
}
