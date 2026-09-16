import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import TeacherApplication from '@/models/TeacherApplication';

/**
 * Teacher Admission API Routes
 * ----------------------------
 * POST: Submit new teacher application
 * GET: Check application status by email
 */

// POST - Submit a new teacher application
export async function POST(request: Request) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { name, email, phone, qualification, experience, subjects, resume } = body;

    // Validate required fields
    if (!name || !email || !phone || !qualification || !experience || !subjects) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate phone format (Indian mobile numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit phone number' },
        { status: 400 }
      );
    }

    // Validate minimum qualification (at least 5 characters)
    if (qualification.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Please provide detailed qualification information' },
        { status: 400 }
      );
    }

    // Validate subjects array
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please select at least one subject' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingByEmail = await TeacherApplication.findOne({ email: email.toLowerCase() });
    if (existingByEmail) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'An application with this email already exists. Please check your application status.' 
        },
        { status: 409 }
      );
    }

    // Check for duplicate phone
    const existingByPhone = await TeacherApplication.findOne({ phone });
    if (existingByPhone) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'An application with this phone number already exists. Please check your application status.' 
        },
        { status: 409 }
      );
    }

    // Create new application
    const application = new TeacherApplication({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      qualification: qualification.trim(),
      experience: experience.trim(),
      subjects,
      resume: resume || '',
      status: 'pending',
    });

    await application.save();

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will review and get back to you soon.',
      applicationId: application._id,
    });
  } catch (error) {
    console.error('Error submitting teacher application:', error);
    
    // Handle mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET - Check application status by email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required to check status' },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await TeacherApplication.findOne({ 
      email: email.toLowerCase() 
    }).select('name email status createdAt reviewedAt');

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'No application found with this email' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        name: application.name,
        email: application.email,
        status: application.status,
        submittedAt: application.createdAt,
        reviewedAt: application.reviewedAt,
      },
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
