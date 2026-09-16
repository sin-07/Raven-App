import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/database';
import Notice from '@/models/Notice';

// DELETE a notice (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Verify admin token
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Admin authentication required'
      }, { status: 401 });
    }

    // Verify token
    jwt.verify(
      token, 
      process.env.JWT_SECRET || 'raven-tutorials-secret-key'
    );

    const { id } = await params;
    const notice = await Notice.findByIdAndDelete(id);

    if (!notice) {
      return NextResponse.json({ 
        success: false, 
        message: 'Notice not found' 
      }, { status: 404 });
    }

    console.log(`[SUCCESS] Notice deleted: ${notice.title}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Notice deleted successfully' 
    });

  } catch (error: any) {
    console.error('Error deleting notice:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete notice' 
    }, { status: 500 });
  }
}
