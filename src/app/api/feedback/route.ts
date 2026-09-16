import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import Feedback from '@/models/Feedback';

// GET - Get student's own feedback
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Verify student token
    const cookieStore = await cookies();
    const token = cookieStore.get('studentToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as { studentId: string };

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [feedback, total] = await Promise.all([
      Feedback.find({ studentId: decoded.studentId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments({ studentId: decoded.studentId })
    ]);

    return NextResponse.json({
      success: true,
      data: feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch feedback'
    }, { status: 500 });
  }
}

// POST - Submit feedback
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Verify student token
    const cookieStore = await cookies();
    const token = cookieStore.get('studentToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'You must be logged in as a student to submit feedback'
      }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as { studentId: string };

    const { category, subject, message, rating } = await req.json();

    console.log('Received feedback submission from authenticated student:', { 
      studentId: decoded.studentId, 
      category, 
      subject, 
      rating 
    });

    // Validation
    if (!subject || !message) {
      return NextResponse.json({
        success: false,
        message: 'Subject and message are required'
      }, { status: 400 });
    }

    if (subject.trim().length < 3) {
      return NextResponse.json({
        success: false,
        message: 'Subject must be at least 3 characters'
      }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({
        success: false,
        message: 'Message must be at least 10 characters'
      }, { status: 400 });
    }

    // Create feedback record
    const feedbackData = {
      studentId: decoded.studentId,
      category: category || 'general',
      subject: subject.trim(),
      message: message.trim(),
      rating: rating || 5,
      status: 'new'
    };

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    console.log('Feedback saved successfully:', feedback._id);

    return NextResponse.json({
      success: true,
      data: {
        feedbackId: feedback._id,
        message: 'Thank you for your feedback!'
      },
      message: 'Feedback submitted successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to submit feedback'
    }, { status: 500 });
  }
}
