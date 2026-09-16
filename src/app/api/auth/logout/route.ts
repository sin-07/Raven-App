import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    const sameSiteMode: 'none' | 'lax' = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: sameSiteMode,
      maxAge: 0,
      path: '/',
    };

    response.cookies.set('token', '', cookieOptions);
    response.cookies.set('studentToken', '', cookieOptions);
    response.cookies.set('adminToken', '', cookieOptions);

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during logout' },
      { status: 500 }
    );
  }
}

