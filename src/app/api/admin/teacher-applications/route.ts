import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/database';
import TeacherApplication from '@/models/TeacherApplication';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Admin Teacher Applications API
 * ------------------------------
 * GET: List all applications with filtering
 * PATCH: Update application status (approve/reject)
 */

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

// GET - List all teacher applications
export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectDB();

    // Build query
    const query: Record<string, unknown> = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Get total count for pagination
    const total = await TeacherApplication.countDocuments(query);

    // Fetch applications with pagination
    const applications = await TeacherApplication.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching teacher applications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// PATCH - Update application status
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId, status, adminNotes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, message: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await TeacherApplication.findByIdAndUpdate(
      applicationId,
      {
        status,
        adminNotes: adminNotes || '',
        reviewedBy: (admin as { email?: string }).email || 'Admin',
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      application,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update application' },
      { status: 500 }
    );
  }
}
