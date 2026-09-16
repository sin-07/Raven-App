import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/database';
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

// GET - Get videos by student's standard
// NOTE: This is a placeholder - Video feature is "Coming Soon"
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
    
    // Video feature is "Coming Soon" - return empty array for now
    // When Video model is implemented, query videos by student's standard here
    
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Video feature coming soon'
    });
  } catch (error: any) {
    console.error('Get videos by standard error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching videos', error: error.message },
      { status: 500 }
    );
  }
}
