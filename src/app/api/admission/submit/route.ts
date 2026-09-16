import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import TempAdmission from '@/models/TempAdmission';
import Admission from '@/models/Admission';
import Student from '@/models/Student';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const generateOTP = (): string => crypto.randomInt(100000, 999999).toString();

const REQUIRED_FIELDS = [
  'studentName', 'fatherName', 'motherName', 'dateOfBirth', 'gender',
  'bloodGroup', 'category', 'phoneNumber', 'email', 'address',
  'city', 'state', 'pincode', 'standard', 'previousSchool'
];

export async function POST(request: NextRequest) {
  try {
    // Validate environment
    if (!process.env.MONGODB_URI || !process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    await connectDB();
    
    const formData = await request.formData();
    
    // Extract form fields
    const fields: Record<string, string> = {};
    REQUIRED_FIELDS.forEach(field => {
      fields[field] = formData.get(field) as string;
    });
    fields.alternatePhoneNumber = formData.get('alternatePhoneNumber') as string || '';
    const photo = formData.get('photo') as File;

    // Validate required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !fields[field]);
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    if (!photo) {
      return NextResponse.json({ success: false, message: 'Student photo is required' }, { status: 400 });
    }

    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'Photo size must be less than 5MB' }, { status: 400 });
    }

    const emailLower = fields.email.toLowerCase().trim();

    // Check for existing registration
    const [existingAdmission, existingStudent] = await Promise.all([
      Admission.findOne({ email: emailLower }),
      Student.findOne({ email: emailLower })
    ]);

    if (existingAdmission || existingStudent) {
      return NextResponse.json({
        success: false,
        message: 'This email is already registered.'
      }, { status: 400 });
    }

    // Cleanup old data
    await Promise.all([
      TempAdmission.deleteOne({ email: emailLower }),
      TempAdmission.deleteMany({ expiresAt: { $lte: new Date() } })
    ]);

    // Upload photo
    const buffer = Buffer.from(await photo.arrayBuffer());
    const dataUri = `data:${photo.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'raven-tutorials/students',
      resource_type: 'auto',
      timeout: 60000
    });

    if (!uploadResult?.secure_url) {
      return NextResponse.json({ success: false, message: 'Photo upload failed' }, { status: 500 });
    }

    // Create temp admission
    const otp = generateOTP();
    const tempAdmission = await TempAdmission.create({
      ...fields,
      email: emailLower,
      photo: uploadResult.secure_url,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Send OTP (non-blocking)
    sendOTPEmail({ to: emailLower, studentName: fields.studentName, otp }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email. Please verify to continue.',
      data: {
        tempAdmissionId: tempAdmission._id,
        studentName: tempAdmission.studentName,
        email: tempAdmission.email,
        amount: parseInt(process.env.ADMISSION_FEE || '1000')
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admission Error:', error.message);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error submitting admission form'
    }, { status: 500 });
  }
}
