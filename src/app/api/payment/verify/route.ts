import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import crypto from 'crypto';
import TempAdmission from '@/models/TempAdmission';
import Admission from '@/models/Admission';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tempAdmissionId
    } = await request.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({
        success: false,
        message: 'Payment verification failed'
      }, { status: 400 });
    }

    // Clean up expired temp admissions
    await TempAdmission.deleteMany({ 
      expiresAt: { $lte: new Date() } 
    });

    // Find temp admission
    const tempAdmission = await TempAdmission.findById(tempAdmissionId);

    if (!tempAdmission) {
      return NextResponse.json({
        success: false,
        message: 'Admission session expired or not found. Please start again.'
      }, { status: 404 });
    }

    // Check if session has expired
    if (new Date() >= new Date(tempAdmission.expiresAt)) {
      await TempAdmission.deleteOne({ _id: tempAdmission._id });
      return NextResponse.json({
        success: false,
        message: 'Admission session expired. Payment cannot be processed. Please start again.'
      }, { status: 410 });
    }

    // Check if OTP is verified
    if (!tempAdmission.isVerified) {
      return NextResponse.json({
        success: false,
        message: 'Please verify OTP before payment'
      }, { status: 400 });
    }

    // Check if email already exists in permanent admissions
    const existingAdmission = await Admission.findOne({ 
      email: tempAdmission.email.toLowerCase().trim() 
    });
    
    if (existingAdmission) {
      await TempAdmission.deleteOne({ _id: tempAdmission._id });
      return NextResponse.json({
        success: false,
        message: 'This email is already registered. Duplicate prevented.'
      }, { status: 400 });
    }

    // Generate Registration ID (RT-2025-XXXX format)
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const registrationId = `RT-2025-${randomNumber}`;

    // Generate Password from Date of Birth (DDMMYYYY format)
    const dob = new Date(tempAdmission.dateOfBirth);
    const day = String(dob.getDate()).padStart(2, '0');
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const year = dob.getFullYear();
    const password = `${day}${month}${year}`;

    // Create permanent admission
    const permanentAdmission = await Admission.create({
      studentName: tempAdmission.studentName,
      fatherName: tempAdmission.fatherName,
      motherName: tempAdmission.motherName,
      dateOfBirth: tempAdmission.dateOfBirth,
      gender: tempAdmission.gender,
      bloodGroup: tempAdmission.bloodGroup,
      category: tempAdmission.category,
      phoneNumber: tempAdmission.phoneNumber,
      alternatePhoneNumber: tempAdmission.alternatePhoneNumber,
      email: tempAdmission.email,
      address: tempAdmission.address,
      city: tempAdmission.city,
      state: tempAdmission.state,
      pincode: tempAdmission.pincode,
      standard: tempAdmission.standard,
      previousSchool: tempAdmission.previousSchool,
      photo: tempAdmission.photo,
      paymentAmount: parseInt(process.env.ADMISSION_FEE || '1000'),
      paymentStatus: 'completed',
      isPendingPayment: false,  // CRITICAL: Set to false after successful payment
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentDate: new Date(),
      registrationId: registrationId,
      password: password,
      isVerified: true
    });

    console.log('[SUCCESS] Admission created with password:', password);
    console.log('[SUCCESS] isPendingPayment set to:', false);

    // Delete temp admission
    await TempAdmission.deleteOne({ _id: tempAdmission._id });

    // Send registration credentials email
    const emailSent = await sendWelcomeEmail({
      to: permanentAdmission.email,
      studentName: permanentAdmission.studentName,
      registrationId: registrationId,
      password: password
    });

    if (!emailSent) {
      console.error(`Failed to send welcome email to ${permanentAdmission.email}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! Registration complete.',
      data: {
        admissionId: permanentAdmission._id,
        paymentId: razorpay_payment_id,
        registrationId: registrationId,
        password: password,
        loginEmail: permanentAdmission.email
      }
    });

  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error verifying payment'
    }, { status: 500 });
  }
}
