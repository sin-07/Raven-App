import { NextResponse } from 'next/server';
import Admission from '@/models/Admission';
import Test from '@/models/Test';
import Attendance from '@/models/Attendance';
import TeacherApplication from '@/models/TeacherApplication';
import Course from '@/models/Course';
import { authenticateAdmin } from '@/lib/apiMiddleware';

export const dynamic = 'force-dynamic';

export async function GET() {

  try {
    const { admin, error } = await authenticateAdmin();
    if (error || !admin) {
      return error || NextResponse.json({ success: false, message: 'Admin authentication required' }, { status: 401 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      totalCourses,
      totalTests,
      recentAdmissions,
      todayAttendance,
      totalTeacherApplications,
      pendingTeacherApplications,
      upcomingTests,
      recentTeacherApplications,
    ] = await Promise.all([
      Admission.countDocuments({ paymentStatus: 'completed' }).catch(() => 0),
      Course.countDocuments({ isPublished: true }).catch(() => 0),
      Test.countDocuments().catch(() => 0),
      Admission.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
        paymentStatus: 'completed',
      }).catch(() => 0),
      Attendance.countDocuments({ date: { $gte: today } }).catch(() => 0),
      TeacherApplication.countDocuments().catch(() => 0),
      TeacherApplication.countDocuments({ status: 'pending' }).catch(() => 0),
      Test.find({
        startDate: { $gte: today },
        status: { $in: ['PUBLISHED', 'Published'] },
      })
        .limit(5)
        .select('testId title startDate endDate standard subject status duration totalMarks')
        .sort({ startDate: 1 })
        .lean()
        .catch(() => []),
      TeacherApplication.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email phoneNumber qualification subjects status createdAt')
        .lean()
        .catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCourses,
          totalTests,
          recentAdmissions,
          todayAttendance,
          totalTeacherApplications,
          pendingTeacherApplications,
        },
        upcomingTests,
        recentTeacherApplications,
      },
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching dashboard stats' },
      { status: 500 }
    );
  }
}

