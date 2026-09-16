import { NextRequest, NextResponse } from 'next/server';
import Admission from '@/models/Admission';
import { authenticateAdmin } from '@/lib/apiMiddleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { admin, error } = await authenticateAdmin();
    if (error || !admin) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const student = await Admission.findById(id).select('-password').lean();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    console.error('Get Student Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching student' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { admin, error } = await authenticateAdmin();
    if (error || !admin) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const updates = await request.json();

    delete updates.password;
    delete updates._id;

    const student = await Admission.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .select('-password')
      .lean();

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error: any) {
    console.error('Update Student Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { admin, error } = await authenticateAdmin();
    if (error || !admin) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const student = await Admission.findByIdAndDelete(id);

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete Student Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting student' },
      { status: 500 }
    );
  }
}

