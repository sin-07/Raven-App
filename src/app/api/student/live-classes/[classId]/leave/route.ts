import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/database';
import LiveClass from '@/models/LiveClass';

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

// POST - Leave live class (record exit time)
export async function POST(
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
    
    const liveClass = await LiveClass.findById(classId);
    
    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Live class not found' },
        { status: 404 }
      );
    }
    
    // Find participant and update left time
    const participant = liveClass.participants?.find(
      (p: any) => p.participantId && p.participantId.toString() === studentId.toString() && !p.leftAt
    );
    
    if (participant) {
      participant.leftAt = new Date();
      await liveClass.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Left live class successfully'
    });
  } catch (error: any) {
    console.error('Leave live class error:', error);
    return NextResponse.json(
      { success: false, message: 'Error leaving live class', error: error.message },
      { status: 500 }
    );
  }
}
