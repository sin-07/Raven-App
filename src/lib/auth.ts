import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDatabase } from './database';
import Admin, { IAdmin } from '@/models/Admin';
import Admission, { IAdmission } from '@/models/Admission';

const JWT_SECRET = process.env.JWT_SECRET || 'raven-tutorials-secret-key-production-change';

export interface JWTPayload {
  id?: string;
  studentId?: string;
  email: string;
  registrationId?: string;
  role?: string;
}

export interface AdminAuthResult {
  success: boolean;
  admin?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface StudentAuthResult {
  success: boolean;
  student?: {
    _id: string;
    email: string;
    registrationId: string;
    studentName: string;
    standard: string;
    photo?: string;
  };
}

export async function verifyAdminToken(token?: string): Promise<AdminAuthResult> {
  try {
    let authToken = token;

    if (!authToken) {
      const cookieStore = cookies();
      authToken = cookieStore.get('adminToken')?.value;
    }

    if (!authToken) {
      return { success: false };
    }

    const decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;

    await connectDatabase();
    const admin = await Admin.findById(decoded.id).select('-password').lean() as (IAdmin & { _id: any }) | null;

    if (!admin || !admin.isActive) {
      return { success: false };
    }

    return {
      success: true,
      admin: {
        _id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  } catch {
    return { success: false };
  }
}

export async function verifyStudentToken(token?: string): Promise<StudentAuthResult> {
  try {
    let authToken = token;

    if (!authToken) {
      const cookieStore = cookies();
      authToken = cookieStore.get('token')?.value || cookieStore.get('studentToken')?.value;
    }

    if (!authToken) {
      return { success: false };
    }

    const decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;

    await connectDatabase();
    const query = decoded.registrationId
      ? { registrationId: decoded.registrationId }
      : { _id: decoded.studentId || decoded.id };

    const student = await Admission.findOne(query).lean() as (IAdmission & { _id: any }) | null;

    if (!student || student.paymentStatus !== 'completed') {
      return { success: false };
    }

    return {
      success: true,
      student: {
        _id: student._id.toString(),
        email: student.email,
        registrationId: student.registrationId || '',
        studentName: student.studentName,
        standard: student.standard,
        photo: student.photo,
      },
    };
  } catch {
    return { success: false };
  }
}

export function generateAdminToken(adminId: string, email: string): string {
  return jwt.sign({ id: adminId, email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

export function generateStudentToken(studentId: string, email: string, registrationId: string): string {
  return jwt.sign({ studentId, id: studentId, email, registrationId }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function setAdminCookie(token: string) {
  const sameSiteMode: 'none' | 'lax' = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
  return {
    name: 'adminToken',
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: sameSiteMode,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    },
  };
}

export function setStudentCookie(token: string) {
  const sameSiteMode: 'none' | 'lax' = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
  return {
    name: 'token',
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: sameSiteMode,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    },
  };
}


