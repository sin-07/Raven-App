import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/database';
import Admission from '@/models/Admission';

const JWT_SECRET = process.env.JWT_SECRET || 'raven-tutorials-secret-key-production-change';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('studentToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Not logged in',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      studentId?: string;
      id?: string;
      email: string;
      registrationId?: string;
    };

    await connectDB();

    const query = decoded.registrationId
      ? { registrationId: decoded.registrationId }
      : { _id: decoded.studentId || decoded.id };

    const student = await Admission.findOne(query).lean();

    if (!student || student.paymentStatus !== 'completed') {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Invalid session or payment incomplete',
      });
    }

    const studentData = {
      _id: student._id.toString(),
      registrationId: student.registrationId || '',
      studentName: student.studentName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      standard: student.standard,
      bloodGroup: student.bloodGroup,
      fatherName: student.fatherName,
      motherName: student.motherName,
      address: student.address,
      city: student.city,
      state: student.state,
      pincode: student.pincode,
      photo: student.photo,
      photoUrl: student.photo,
      paymentStatus: student.paymentStatus,
      enrolledCourses: student.enrolledCourses || [],
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      student: studentData,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      authenticated: false,
      message: 'Invalid or expired token',
    });
  }
}

