import { NextResponse } from 'next/server';
import Attendance from '@/models/Attendance';
import { authenticateStudent } from '@/lib/apiMiddleware';

export async function GET() {
  try {
    const { student, error } = await authenticateStudent();
    if (error || !student) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Get attendance records for this student's class
    const attendanceRecords = await Attendance.find({
      class: student.standard,
    })
      .sort({ date: -1 })
      .lean();

    // Calculate subject-wise attendance
    const subjectMap: Record<string, { present: number; total: number }> = {};

    attendanceRecords.forEach((record: any) => {
      const subject = record.subject || 'General';

      if (!subjectMap[subject]) {
        subjectMap[subject] = { present: 0, total: 0 };
      }

      subjectMap[subject].total++;

      // Check if student was present
      const studentAttendance = record.students?.find(
        (s: any) => s.studentId?.toString() === student._id.toString()
      );

      if (studentAttendance?.status === 'Present') {
        subjectMap[subject].present++;
      }
    });

    const attendanceData = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      present: data.present,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: attendanceData,
    });
  } catch (error: any) {
    console.error('Attendance Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching attendance' },
      { status: 500 }
    );
  }
}

