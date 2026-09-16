import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Admission from '@/models/Admission';
import Admin from '@/models/Admin';
import {
  generateStudentToken,
  setStudentCookie,
  generateAdminToken,
  setAdminCookie,
} from '@/lib/auth';
import bcrypt from 'bcryptjs';

const parseDOBPassword = (dobString: string): Date | null => {
  try {
    if (!dobString) return null;
    const clean = dobString.replace(/[-/]/g, '');
    if (clean.length === 8) {
      // DDMMYYYY
      const day = parseInt(clean.substring(0, 2), 10);
      const month = parseInt(clean.substring(2, 4), 10) - 1;
      const year = parseInt(clean.substring(4, 8), 10);
      return new Date(Date.UTC(year, month, day));
    }
    const d = new Date(dobString);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const compareDates = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getUTCDate() === d2.getUTCDate() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCFullYear() === d2.getUTCFullYear()
  );
};

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

    const { email, identifier, username, password } = body;
    const inputIdentifier = (email || identifier || username || '').trim().toLowerCase();

    if (!inputIdentifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Email address and password are required' },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ADMIN AUTHENTICATION (Environment Variables & Admin Model)
    // ─────────────────────────────────────────────────────────────────────────
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '';

    const isEnvAdminMatch =
      envAdminEmail &&
      envAdminPassword &&
      inputIdentifier === envAdminEmail &&
      password === envAdminPassword;

    if (isEnvAdminMatch) {
      let adminId = 'admin_primary';
      try {
        let admin = await Admin.findOne({ email: inputIdentifier });
        if (!admin) {
          admin = new Admin({
            email: inputIdentifier,
            password: password,
            name: 'Admin',
            role: 'admin',
            isActive: true,
          });
        } else {
          admin.isActive = true;
          const matchesHashed = await admin.comparePassword(password);
          if (!matchesHashed) {
            admin.password = password;
          }
        }
        admin.lastLogin = new Date();
        await admin.save();
        adminId = admin._id.toString();
      } catch (dbErr) {
        console.warn('[AUTH] Admin DB sync notice, proceeding with verified credentials:', dbErr);
      }

      const adminToken = generateAdminToken(adminId, envAdminEmail);

      const response = NextResponse.json({
        success: true,
        role: 'admin',
        redirectTo: '/admin/dashboard',
        message: 'Welcome back, Admin!',
        token: adminToken,
        user: {
          id: adminId,
          email: envAdminEmail,
          name: 'Admin',
          role: 'admin',
        },
      });

      const cookieOptions = setAdminCookie(adminToken);
      response.cookies.set('adminToken', cookieOptions.value, cookieOptions.options as any);
      return response;
    }

    // Secondary DB Admin check (if database admin exists)
    const dbAdmin = await Admin.findOne({ email: inputIdentifier });
    if (dbAdmin && dbAdmin.isActive) {
      const isMatch = await dbAdmin.comparePassword(password);
      if (isMatch) {
        dbAdmin.lastLogin = new Date();
        await dbAdmin.save();

        const adminToken = generateAdminToken(dbAdmin._id.toString(), dbAdmin.email);

        const response = NextResponse.json({
          success: true,
          role: 'admin',
          redirectTo: '/admin/dashboard',
          message: 'Welcome back, Admin!',
          token: adminToken,
          user: {
            id: dbAdmin._id.toString(),
            email: dbAdmin.email,
            name: dbAdmin.name,
            role: dbAdmin.role,
          },
        });

        const cookieOptions = setAdminCookie(adminToken);
        response.cookies.set('adminToken', cookieOptions.value, cookieOptions.options as any);
        return response;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. STUDENT AUTHENTICATION
    // ─────────────────────────────────────────────────────────────────────────
    const isEmail = inputIdentifier.includes('@');
    const studentQuery = isEmail
      ? { email: inputIdentifier }
      : { registrationId: inputIdentifier.toUpperCase() };

    const student = await Admission.findOne(studentQuery).lean();

    if (student) {
      if (student.paymentStatus !== 'completed') {
        return NextResponse.json(
          {
            success: false,
            message: 'Admission payment is pending. Please complete your admission payment.',
          },
          { status: 403 }
        );
      }

      let isPasswordValid = false;

      if (student.password) {
        if (student.password.startsWith('$2a$') || student.password.startsWith('$2b$')) {
          isPasswordValid = await bcrypt.compare(password, student.password);
        } else {
          isPasswordValid = student.password === password;
        }
      }

      if (!isPasswordValid && student.dateOfBirth) {
        const dobFromPassword = parseDOBPassword(password);
        if (dobFromPassword && compareDates(dobFromPassword, student.dateOfBirth)) {
          isPasswordValid = true;
        }
      }

      if (isPasswordValid) {
        const studentId = student._id.toString();
        const regId = student.registrationId || '';
        const token = generateStudentToken(studentId, student.email, regId);

        const studentData = {
          _id: studentId,
          registrationId: regId,
          studentName: student.studentName,
          email: student.email,
          phoneNumber: student.phoneNumber,
          standard: student.standard,
          bloodGroup: student.bloodGroup,
          fatherName: student.fatherName,
          motherName: student.motherName,
          address: student.address,
          city: student.city,
          state: student.state,
          pincode: student.pincode,
          photoUrl: student.photo,
          paymentStatus: student.paymentStatus,
          enrolledCourses: student.enrolledCourses || [],
        };

        const response = NextResponse.json({
          success: true,
          role: 'student',
          redirectTo: '/dashboard',
          message: 'Welcome back!',
          student: studentData,
          token,
        });

        const cookieOptions = setStudentCookie(token);
        response.cookies.set('token', cookieOptions.value, cookieOptions.options as any);
        response.cookies.set('studentToken', cookieOptions.value, cookieOptions.options as any);

        return response;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. INVALID CREDENTIALS
    // ─────────────────────────────────────────────────────────────────────────
    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Unified login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during login' },
      { status: 500 }
    );
  }
}


