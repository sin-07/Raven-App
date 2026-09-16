import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import TempAdmission from '@/models/TempAdmission';
import Razorpay from 'razorpay';

// Lazy initialization of Razorpay to avoid build-time errors
let razorpayInstance: Razorpay | null = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not found in environment variables');
    }
    
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { tempAdmissionId, otp, email } = await request.json();

    if (!tempAdmissionId || !otp || !email) {
      return NextResponse.json({
        success: false,
        message: 'Admission ID, OTP and email are required'
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

    // Check if already verified
    if (tempAdmission.isVerified) {
      return NextResponse.json({
        success: false,
        message: 'OTP already verified. Please proceed to payment.'
      }, { status: 400 });
    }

    // Check OTP expiry
    if (!tempAdmission.otpExpiry || new Date() > tempAdmission.otpExpiry) {
      return NextResponse.json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      }, { status: 400 });
    }

    // Verify OTP
    if (!tempAdmission.otp || tempAdmission.otp !== otp) {
      return NextResponse.json({
        success: false,
        message: 'Invalid OTP'
      }, { status: 400 });
    }

    // Mark as verified
    tempAdmission.isVerified = true;
    tempAdmission.otp = undefined;
    tempAdmission.otpExpiry = undefined;
    await tempAdmission.save();

    // Create Razorpay order
    const admissionFee = parseInt(process.env.ADMISSION_FEE || '1000');
    
    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    
    const order = await razorpay.orders.create({
      amount: admissionFee * 100, // Convert to paise
      currency: 'INR',
      receipt: `admission_${tempAdmission._id}`,
      notes: {
        tempAdmissionId: tempAdmission._id.toString(),
        studentName: tempAdmission.studentName,
        email: tempAdmission.email,
        standard: tempAdmission.standard
      }
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully! Please proceed to payment.',
      data: {
        tempAdmissionId: tempAdmission._id,
        studentName: tempAdmission.studentName,
        email: tempAdmission.email,
        standard: tempAdmission.standard,
        amount: admissionFee,
        orderId: order.id,
        currency: order.currency,
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      }
    });

  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error verifying OTP'
    }, { status: 500 });
  }
}
