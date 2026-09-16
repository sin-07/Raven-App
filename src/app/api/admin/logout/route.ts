import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully'
    });

    // Clear the httpOnly cookie
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Admin logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during logout'
    }, { status: 500 });
  }
}
