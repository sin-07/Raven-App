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

// POST - Join live class (record attendance)
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
    
    // Get student info
    const student = await Admission.findById(studentId).select('standard name').lean();
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }
    
    const liveClass = await LiveClass.findOne({ classId });
    
    if (!liveClass) {
      return NextResponse.json(
        { success: false, message: 'Live class not found' },
        { status: 404 }
      );
    }
    
    // Check if student's class matches
    const studentStandard = (student as any).standard;
    const classStandard = liveClass.class;
    
    if (classStandard !== 'All' && classStandard !== studentStandard) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to join this class' },
        { status: 403 }
      );
    }
    
    // Check if already joined
    const alreadyJoined = liveClass.participants?.some(
      (p: any) => p.participantId && p.participantId.toString() === studentId.toString()
    );
    
    if (!alreadyJoined) {
      // Add participant
      if (!liveClass.participants) {
        liveClass.participants = [];
      }
      liveClass.participants.push({
        participantId: studentId as any,
        joinedAt: new Date()
      });
      
      await liveClass.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Joined live class successfully',
      data: {
        classId: liveClass._id,
        roomName: liveClass.roomName,
        subject: liveClass.subject,
        title: liveClass.title
      }
    });
  } catch (error: any) {
    console.error('Join live class error:', error);
    return NextResponse.json(
      { success: false, message: 'Error joining live class', error: error.message },
      { status: 500 }
    );
  }
}
