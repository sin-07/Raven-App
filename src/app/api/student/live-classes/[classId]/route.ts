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

// GET - Get single live class details for student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const studentId = await verifyStudentToken();
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { classId } = await params;
    
    await connectDB();
    
    // Get student's class
    const student = await Admission.findById(studentId).select('standard name').lean();
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }
    
    const liveClass = await LiveClass.findById(classId)
      .select('-participants')
      .lean();
    
    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Live class not found' },
        { status: 404 }
      );
    }
    
    // Check if student's class matches
    const studentStandard = (student as any).standard;
    const classStandard = (liveClass as any).class;
    
    if (classStandard !== 'All' && classStandard !== studentStandard) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to join this class' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: liveClass
    });
  } catch (error: any) {
    console.error('Get live class error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching live class', error: error.message },
      { status: 500 }
    );
  }
}
