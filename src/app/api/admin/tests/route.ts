import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Test from '@/models/Test';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// ============================================
// HELPER: Generate unique Test ID
// ============================================
async function generateTestId(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `TEST${year}${month}`;
  
  const lastTest = await Test.findOne({ testId: { $regex: `^${prefix}` } })
    .sort({ testId: -1 });
  
  let sequence = 1;
  if (lastTest) {
    const lastSequence = parseInt(lastTest.testId.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
}

// ============================================
// HELPER: Auto-expire tests past endDate
// ============================================
async function autoExpireTests(): Promise<void> {
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

// ============================================
// GET: Fetch all tests (Admin only)
// ============================================
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Please login as admin'
      }, { status: 401 });
    }

    const decoded = await verifyAdminToken(token);
    if (!decoded.success || !decoded.admin) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }

    await connectDB();

    // Auto-expire old tests
    await autoExpireTests();

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const standardFilter = searchParams.get('standard');
    const statusFilter = searchParams.get('status');

    // Build query
    const query: any = {};
    if (standardFilter) query.standard = standardFilter;
    if (statusFilter) query.status = statusFilter;

    // Fetch tests sorted by creation date (newest first)
    const tests = await Test.find(query)
      .sort({ createdAt: -1 })
      .select('-results'); // Exclude results for list view

    return NextResponse.json({
      success: true,
      data: tests,
      count: tests.length
    });

  } catch (error: any) {
    console.error('Admin GET Tests Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching tests'
    }, { status: 500 });
  }
}

// ============================================
// POST: Create new test (Admin only) - Saved as DRAFT
// ============================================
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Please login as admin'
      }, { status: 401 });
    }

    const decoded = await verifyAdminToken(token);
    if (!decoded.success || !decoded.admin) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const {
      title,
      description,
      standard,
      subject,
      startDate,
      endDate,
      duration,
      passingMarks,
      questions
    } = body;

    // ========== VALIDATION ==========
    
    // Required fields check
    if (!title || !standard || !subject || !startDate || !endDate || !duration || passingMarks === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: title, standard, subject, startDate, endDate, duration, passingMarks'
      }, { status: 400 });
    }

    // Validate questions exist
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'At least one question is required'
      }, { status: 400 });
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({
        success: false,
        message: 'Invalid date format'
      }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({
        success: false,
        message: 'End date must be after start date'
      }, { status: 400 });
    }

    // Calculate total marks from questions
    const totalMarks = questions.reduce((sum: number, q: any) => sum + Number(q.marks || 0), 0);

    if (totalMarks <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Total marks must be greater than 0'
      }, { status: 400 });
    }

    if (Number(passingMarks) > totalMarks) {
      return NextResponse.json({
        success: false,
        message: 'Passing marks cannot exceed total marks'
      }, { status: 400 });
    }

    // Generate unique test ID
    const testId = await generateTestId();

    // ========== CREATE TEST (Always as DRAFT) ==========
    const test = await Test.create({
      testId,
      title: title.trim(),
      description: description?.trim() || '',
      standard,
      subject: subject.trim(),
      startDate: start,
      endDate: end,
      duration: Number(duration),
      totalMarks,
      passingMarks: Number(passingMarks),
      questions,
      status: 'DRAFT', // IMPORTANT: Always create as DRAFT
      createdBy: decoded.admin._id
    });

    return NextResponse.json({
      success: true,
      message: 'Test created successfully as DRAFT. Admin can publish it to make it visible to students.',
      data: test
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admin Create Test Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error creating test'
    }, { status: 500 });
  }
}
