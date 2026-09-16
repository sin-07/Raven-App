import { NextRequest, NextResponse } from 'next/server';
import Admission from '@/models/Admission';
import { authenticateAdmin } from '@/lib/apiMiddleware';

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await authenticateAdmin();
    if (error || !admin) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const classFilter = searchParams.get('class');
    const paymentStatus = searchParams.get('paymentStatus');

    const query: any = {};

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationId: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (classFilter && classFilter !== 'All') {
      const clean = classFilter.replace(/\D/g, '');
      query.standard = {
        $in: [classFilter, `${clean}th`, `${clean}th standard`, clean],
      };
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    const students = await Admission.find(query)
      .sort({ createdAt: -1 })
      .select('-password')
      .lean();

    return NextResponse.json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error: any) {
    console.error('Admin Students Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching students' },
      { status: 500 }
    );
  }
}

