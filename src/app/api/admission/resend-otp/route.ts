import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import TempAdmission from '@/models/TempAdmission';
import crypto from 'crypto';

// Generate new OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { tempAdmissionId, email } = await request.json();

    if (!tempAdmissionId || !email) {
      return NextResponse.json({
        success: false,
        message: 'Admission ID and email are required'
      }, { status: 400 });
    }

    // Find temp admission
    const tempAdmission = await TempAdmission.findById(tempAdmissionId);

    if (!tempAdmission) {
      return NextResponse.json({
        success: false,
        message: 'Admission session not found'
      }, { status: 404 });
    }

    // Verify email matches
    if (tempAdmission.email !== email.toLowerCase().trim()) {
      return NextResponse.json({
        success: false,
        message: 'Invalid admission session'
      }, { status: 400 });
    }

    // Check if session has expired
    if (new Date() >= new Date(tempAdmission.expiresAt)) {
      await TempAdmission.deleteOne({ _id: tempAdmission._id });
      return NextResponse.json({
        success: false,
        message: 'Admission session expired. Please start again.'
      }, { status: 410 });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    tempAdmission.otp = newOtp;
    tempAdmission.otpExpiry = otpExpiry;
    tempAdmission.isVerified = false;
    await tempAdmission.save();

    // TODO: Send OTP email (implement email service)
    console.log(`Resent OTP for ${email}: ${newOtp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully. Please check your email.'
    });

  } catch (error: any) {
    console.error('Resend OTP Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error resending OTP'
    }, { status: 500 });
  }
}
