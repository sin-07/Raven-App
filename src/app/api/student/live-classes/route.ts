import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/database';
import LiveClass from '@/models/LiveClass';
import Admission from '@/models/Admission';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

// Helper function to verify student token
async function verifyStudentToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('studentToken')?.value;
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded.id;
  } catch {
    return null;
  }
}

// GET - Get live classes for logged-in student
export async function GET(request: NextRequest) {
  try {
    const studentId = await verifyStudentToken();
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Get student's class
    const student = await Admission.findById(studentId).select('standard').lean();
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get live classes for student's class or "All" classes
    const liveClasses = await LiveClass.find({
      $or: [
        { class: (student as any).standard },
        { class: 'All' }
      ],
      scheduledDate: { $gte: today },
      status: { $in: ['Scheduled', 'Live'] }
    })
      .select('-participants') // Don't send participant list to students
      .sort({ scheduledDate: 1, startTime: 1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: liveClasses
    });
  } catch (error: any) {
    console.error('Get student live classes error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching live classes', error: error.message },
      { status: 500 }
    );
  }
}
