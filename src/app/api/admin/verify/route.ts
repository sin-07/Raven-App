import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await verifyAdminToken();

    if (!auth.success || !auth.admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired admin token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        admin: auth.admin,
      },
    });
  } catch (error: any) {
    console.error('Admin verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during verification' },
      { status: 500 }
    );
  }
}

