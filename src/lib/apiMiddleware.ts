import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifyStudentToken } from './auth';
import connectDB from './database';

export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role?: string;
}

export interface StudentUser {
  _id: string;
  email: string;
  registrationId: string;
  studentName: string;
  standard: string;
  photo?: string;
}

export interface AdminAuthResult {
  admin: AdminUser | null;
  error: NextResponse | null;
}

export interface StudentAuthResult {
  student: StudentUser | null;
  error: NextResponse | null;
}

// Reusable admin authentication function
export async function authenticateAdmin(): Promise<AdminAuthResult> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return {
        admin: null,
        error: NextResponse.json(
          { success: false, message: 'Admin authentication required' },
          { status: 401 }
        ),
      };
    }

    const decoded = await verifyAdminToken(token);
    if (!decoded.success || !decoded.admin) {
      return {
        admin: null,
        error: NextResponse.json(
          { success: false, message: 'Invalid or expired admin token' },
          { status: 401 }
        ),
      };
    }

    await connectDB();

    return {
      admin: decoded.admin as AdminUser,
      error: null,
    };
  } catch (error) {
    console.error('Admin auth error:', error);
    return {
      admin: null,
      error: NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      ),
    };
  }
}

// Reusable student authentication function
export async function authenticateStudent(): Promise<StudentAuthResult> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('studentToken')?.value;

    if (!token) {
      return {
        student: null,
        error: NextResponse.json(
          { success: false, message: 'Student authentication required' },
          { status: 401 }
        ),
      };
    }

    const decoded = await verifyStudentToken(token);
    if (!decoded.success || !decoded.student) {
      return {
        student: null,
        error: NextResponse.json(
          { success: false, message: 'Invalid or expired student session' },
          { status: 401 }
        ),
      };
    }

    await connectDB();

    return {
      student: decoded.student as StudentUser,
      error: null,
    };
  } catch (error) {
    console.error('Student auth error:', error);
    return {
      student: null,
      error: NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      ),
    };
  }
}

// Standard error response helper
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ success: false, message }, { status });
}

// Standard success response helper
export function successResponse(data: object = {}, status: number = 200, headers?: HeadersInit) {
  return NextResponse.json({ success: true, ...data }, { status, headers });
}

