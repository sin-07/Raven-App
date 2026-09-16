import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Admin from '@/models/Admin';
import { generateAdminToken, setAdminCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { email, password, username } = body;
    const emailToUse = (email || username || '').trim().toLowerCase();

    if (!emailToUse || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '';

    let admin = await Admin.findOne({ email: emailToUse });

    // Check env admin credentials match
    if (
      envAdminEmail &&
      envAdminPassword &&
      emailToUse === envAdminEmail &&
      password === envAdminPassword
    ) {
      if (!admin) {
        admin = new Admin({
          email: emailToUse,
          password: password,
          name: 'Admin',
          role: 'admin',
          isActive: true,
        });
      } else {
        admin.isActive = true;
      }
      admin.lastLogin = new Date();
      await admin.save();
    } else if (admin && admin.isActive) {
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }
      admin.lastLogin = new Date();
      await admin.save();
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateAdminToken(admin._id.toString(), admin.email);

    const adminData = {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    const response = NextResponse.json({
      success: true,
      role: 'admin',
      redirectTo: '/admin/dashboard',
      message: 'Login successful',
      token,
      data: {
        admin: adminData,
      },
    });

    const cookieOptions = setAdminCookie(token);
    response.cookies.set('adminToken', cookieOptions.value, cookieOptions.options as any);

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during authentication' },
      { status: 500 }
    );
  }
}


