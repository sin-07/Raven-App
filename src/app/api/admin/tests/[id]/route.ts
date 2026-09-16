import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Test from '@/models/Test';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// ============================================
// GET: Get single test details (Admin only)
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id } = await params;

    const test = await Test.findById(id);

    if (!test) {
      return NextResponse.json({
        success: false,
        message: 'Test not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: test
    });

  } catch (error: any) {
    console.error('Get Test Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching test'
    }, { status: 500 });
  }
}

// ============================================
// PUT: Update test (Admin only)
// Can only update DRAFT tests
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id } = await params;
    const body = await request.json();

    // Find the test first
    const existingTest = await Test.findById(id);
    
    if (!existingTest) {
      return NextResponse.json({
        success: false,
        message: 'Test not found'
      }, { status: 404 });
    }

    // Only DRAFT tests can be edited
    if (existingTest.status !== 'DRAFT') {
      return NextResponse.json({
        success: false,
        message: `Cannot edit test. Test is ${existingTest.status}. Only DRAFT tests can be edited.`
      }, { status: 400 });
    }

    // Validate date range if dates are being updated
    if (body.startDate && body.endDate) {
      const start = new Date(body.startDate);
      const end = new Date(body.endDate);
      
      if (end <= start) {
        return NextResponse.json({
          success: false,
          message: 'End date must be after start date'
        }, { status: 400 });
      }
    }

    // Recalculate total marks if questions are updated
    if (body.questions && Array.isArray(body.questions)) {
      body.totalMarks = body.questions.reduce((sum: number, q: any) => sum + Number(q.marks || 0), 0);
    }

    // Prevent status change through PUT (use PATCH for publishing)
    delete body.status;
    delete body.publishedBy;
    delete body.publishedAt;

    const updatedTest = await Test.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Test updated successfully',
      data: updatedTest
    });

  } catch (error: any) {
    console.error('Update Test Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error updating test'
    }, { status: 500 });
  }
}

// ============================================
// PATCH: Publish test (Admin only)
// Changes status from DRAFT -> PUBLISHED
// ============================================
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

    // IMPORTANT: Role check - Only admin can publish
    // This is already verified above since only admins have adminToken

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const test = await Test.findById(id);

    if (!test) {
      return NextResponse.json({
        success: false,
        message: 'Test not found'
      }, { status: 404 });
    }

    // Handle publish action
    if (body.action === 'publish' || body.status === 'PUBLISHED') {
      // Validate: Can only publish DRAFT tests
      if (test.status !== 'DRAFT') {
        return NextResponse.json({
          success: false,
          message: `Cannot publish. Test is already ${test.status}.`
        }, { status: 400 });
      }

      // Validate: Must have questions
      if (!test.questions || test.questions.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Cannot publish test without questions'
        }, { status: 400 });
      }

      // Validate: End date should be in future
      const now = new Date();
      if (new Date(test.endDate) <= now) {
        return NextResponse.json({
          success: false,
          message: 'Cannot publish test with past end date'
        }, { status: 400 });
      }

      // Publish the test
      test.status = 'PUBLISHED';
      test.publishedBy = decoded.admin._id as any;
      test.publishedAt = now;
      await test.save();

      return NextResponse.json({
        success: true,
        message: 'Test published successfully! Students can now see this test.',
        data: test
      });
    }

    // Handle unpublish action (revert to DRAFT)
    if (body.action === 'unpublish' || body.status === 'DRAFT') {
      if (test.status !== 'PUBLISHED') {
        return NextResponse.json({
          success: false,
          message: `Cannot unpublish. Test status is ${test.status}.`
        }, { status: 400 });
      }

      test.status = 'DRAFT';
      test.publishedBy = undefined;
      test.publishedAt = undefined;
      await test.save();

      return NextResponse.json({
        success: true,
        message: 'Test unpublished. It is now hidden from students.',
        data: test
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use action: "publish" or "unpublish"'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Publish Test Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error publishing test'
    }, { status: 500 });
  }
}

// ============================================
// DELETE: Delete test (Admin only)
// ============================================
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
    const { id } = await params;

    const test = await Test.findById(id);

    if (!test) {
      return NextResponse.json({
        success: false,
        message: 'Test not found'
      }, { status: 404 });
    }

    // Optional: Prevent deleting published tests with results
    if (test.status === 'PUBLISHED' && test.results && test.results.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete published test with student results. Archive it instead.'
      }, { status: 400 });
    }

    await Test.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete Test Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error deleting test'
    }, { status: 500 });
  }
}
