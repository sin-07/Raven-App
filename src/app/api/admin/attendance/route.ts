import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Attendance from '@/models/Attendance';
import Admission from '@/models/Admission';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendAbsenceNotificationEmail } from '@/lib/email';

// Helper function to send absence emails
async function sendAbsenceEmails(absentStudentIds: string[], subject: string, date: string, className: string) {
  if (absentStudentIds.length === 0) return;
  
  try {
    const absentStudents = await Admission.find({
      _id: { $in: absentStudentIds }
    }).select('studentName email');

    console.log(`📧 Found ${absentStudents.length} absent students to notify`);

    // Send emails asynchronously (don't wait for completion)
    absentStudents.forEach((student) => {
      console.log(`📧 Sending absence email to ${student.email} (${student.studentName})`);
      sendAbsenceNotificationEmail({
        to: student.email,
        studentName: student.studentName,
        subject,
        date,
        className
      }).catch((err) => {
        console.error(`Failed to send absence email to ${student.email}:`, err);
      });
    });
  } catch (emailError) {
    console.error('Error processing absence emails:', emailError);
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = await verifyAdminToken(token);
    if (!decoded.success || !decoded.admin) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const className = searchParams.get('class');
    const subject = searchParams.get('subject');
    const date = searchParams.get('date');

    const query: { class?: string; subject?: string; date?: Date } = {};
    
    if (className) query.class = className;
    if (subject) query.subject = subject;
    if (date) query.date = new Date(date);

    const attendance = await Attendance.find(query)
      .populate('students.studentId', 'studentName registrationId')
      .sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: attendance
    });

  } catch (error: any) {
    console.error('Get Attendance Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error fetching attendance'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = await verifyAdminToken(token);
    if (!decoded.success || !decoded.admin) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { class: className, subject, date, students } = body;

    if (!className || !subject || !date || !students || students.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Please provide class, subject, date, and student attendance'
      }, { status: 400 });
    }

    // Check if attendance already exists for this class/subject/date
    const existingAttendance = await Attendance.findOne({
      class: className,
      subject,
      date: new Date(date)
    });

    if (existingAttendance) {
      // Check if within 2-hour lock period
      const createdAt = new Date(existingAttendance.createdAt);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      // LOCKED for first 2 hours - NO modifications allowed
      if (hoursSinceCreation < 2) {
        const minutesRemaining = Math.ceil((2 - hoursSinceCreation) * 60);
        return NextResponse.json({
          success: false,
          message: `Attendance is locked for ${minutesRemaining} more minutes. Cannot modify within 2 hours of marking.`,
          statusCode: 403
        }, { status: 403 });
      }
      
      // After 2 hours - allow update
      // Find newly marked absent students (compare old vs new)
      const oldAbsentIds = existingAttendance.students
        .filter((s: any) => s.status === 'Absent')
        .map((s: any) => s.studentId.toString());
      
      const newAbsentIds = students
        .filter((s: any) => s.status === 'Absent')
        .map((s: any) => s.studentId);
      
      // Find students who are newly marked absent (weren't absent before)
      const newlyAbsentIds = newAbsentIds.filter((id: string) => !oldAbsentIds.includes(id));
      
      existingAttendance.students = students;
      await existingAttendance.save();

      // Send emails for newly marked absent students
      if (newlyAbsentIds.length > 0) {
        sendAbsenceEmails(newlyAbsentIds, subject, date, className);
      }

      return NextResponse.json({
        success: true,
        message: 'Attendance updated successfully',
        data: existingAttendance
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      class: className,
      subject,
      date: new Date(date),
      students
    });

    // Send email notifications for absent students
    const absentStudentIds = students
      .filter((s: any) => s.status === 'Absent')
      .map((s: any) => s.studentId);

    if (absentStudentIds.length > 0) {
      sendAbsenceEmails(absentStudentIds, subject, date, className);
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance saved successfully',
      data: attendance
    }, { status: 201 });

  } catch (error: any) {
    console.error('Save Attendance Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error saving attendance'
    }, { status: 500 });
  }
}
