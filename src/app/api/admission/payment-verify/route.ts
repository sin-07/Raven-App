import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import TempAdmission from '@/models/TempAdmission';
import Admission from '@/models/Admission';
import { getNextSequence } from '@/models/Counter';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tempAdmissionId,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !tempAdmissionId) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature verification' },
        { status: 400 }
      );
    }

    // Find temp admission
    const tempAdmission = await TempAdmission.findById(tempAdmissionId);

    if (!tempAdmission) {
      return NextResponse.json(
        { success: false, message: 'Admission session not found or expired' },
        { status: 404 }
      );
    }

    if (!tempAdmission.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify OTP before completing payment' },
        { status: 400 }
      );
    }

    // Check if student already exists
    const emailLower = tempAdmission.email.toLowerCase().trim();
    const existingStudent = await Admission.findOne({
      email: emailLower,
      paymentStatus: 'completed',
    });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: 'A student is already registered with this email' },
        { status: 400 }
      );
    }

    // Generate registration ID using atomic counter
    const year = new Date().getFullYear().toString().slice(-2);
    const sequence = await getNextSequence(`registration_${year}`);
    const registrationId = `RT${year}${String(sequence).padStart(4, '0')}`;

    // Generate password from Date of Birth (DDMMYYYY format)
    const dob = new Date(tempAdmission.dateOfBirth);
    const day = String(dob.getUTCDate()).padStart(2, '0');
    const month = String(dob.getUTCMonth() + 1).padStart(2, '0');
    const dobYear = dob.getUTCFullYear();
    const password = `${day}${month}${dobYear}`;

    const admissionFee = parseInt(process.env.ADMISSION_FEE || '1000', 10);

    // Auto-enrolled subjects based on standard
    const standardMap: Record<string, string[]> = {
      '9': ['Mathematics', 'Science', 'Social Science', 'English'],
      '10': ['Mathematics', 'Science', 'Social Science', 'English', 'IT (Optional)'],
      '11': ['Physics', 'Chemistry', 'Biology'],
      '12': ['Physics', 'Chemistry', 'Biology'],
    };

    const annualSubjects = standardMap[tempAdmission.standard] || standardMap[tempAdmission.standard.replace(/\D/g, '')] || [];
    const enrolledCourses = annualSubjects.map((subject) => ({
      courseType: 'annual' as const,
      subject,
      standard: tempAdmission.standard,
      enrolledAt: new Date(),
    }));

    // Create single unified Admission record
    const student = await Admission.create({
      registrationId,
      password,
      studentName: tempAdmission.studentName,
      fatherName: tempAdmission.fatherName,
      motherName: tempAdmission.motherName,
      dateOfBirth: tempAdmission.dateOfBirth,
      gender: tempAdmission.gender,
      bloodGroup: tempAdmission.bloodGroup,
      category: tempAdmission.category,
      phoneNumber: tempAdmission.phoneNumber,
      alternatePhoneNumber: tempAdmission.alternatePhoneNumber,
      email: emailLower,
      address: tempAdmission.address,
      city: tempAdmission.city,
      state: tempAdmission.state,
      pincode: tempAdmission.pincode,
      standard: tempAdmission.standard,
      previousSchool: tempAdmission.previousSchool,
      photo: tempAdmission.photo,
      paymentStatus: 'completed',
      isPendingPayment: false,
      paymentAmount: admissionFee,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      admissionDate: new Date(),
      submittedAt: new Date(),
      isActive: true,
      attendancePercentage: 100,
      enrolledCourses,
    });

    // Cleanup temp admission
    await TempAdmission.deleteOne({ _id: tempAdmission._id });

    // Send welcome email with credentials asynchronously
    sendWelcomeEmail({
      to: student.email,
      studentName: student.studentName,
      registrationId,
      password,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Admission completed successfully!',
      data: {
        registrationId,
        studentName: student.studentName,
        email: student.email,
        password,
        standard: student.standard,
      },
    });
  } catch (error: any) {
    console.error('Admission Payment Verify Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error processing admission payment' },
      { status: 500 }
    );
  }
}
