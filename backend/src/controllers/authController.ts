import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admission from '../models/Admission';
import Admin from '../models/Admin';
import { generateToken } from '../middleware/auth';

export async function login(req: Request, res: Response) {
  try {
    const { identifier, email, password, role } = req.body;
    const loginId = identifier || email;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Email/Registration ID and password are required' });
    }

    // Check if Admin login
    if (role === 'admin' || loginId.includes('@admin') || loginId === process.env.ADMIN_EMAIL) {
      const admin = await Admin.findOne({ email: loginId.toLowerCase() });
      if (admin) {
        const isMatch = await admin.comparePassword(password);
        if (isMatch) {
          const token = generateToken({ id: admin._id, email: admin.email, role: admin.role });
          return res.json({
            success: true,
            role: 'admin',
            token,
            user: {
              id: admin._id.toString(),
              name: admin.name,
              email: admin.email,
              role: 'admin',
            },
          });
        }
      }
    }

    // Check Student login by registrationId, email, or phoneNumber
    const student = await Admission.findOne({
      $or: [
        { registrationId: loginId },
        { email: loginId.toLowerCase() },
        { phoneNumber: loginId },
      ],
      isActive: true,
    });

    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or student not found' });
    }

    // If student has a hashed password, verify with bcrypt, else check fallback matching
    if (student.password) {
      const isMatch = await bcrypt.compare(password, student.password).catch(() => student.password === password);
      if (!isMatch && student.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }
    }

    const token = generateToken({
      id: student._id,
      studentId: student._id,
      registrationId: student.registrationId,
      email: student.email,
      role: 'student',
    });

    return res.json({
      success: true,
      role: 'student',
      token,
      user: {
        id: student._id.toString(),
        name: student.studentName,
        email: student.email,
        phone: student.phoneNumber,
        standard: student.standard,
        registrationId: student.registrationId || '',
        avatar: student.photo || '',
        role: 'student',
      },
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
}

export async function verifyToken(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'raven-tutorials-secret-key-production-change') as any;

    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password').lean() as any;
      if (!admin) return res.status(401).json({ success: false, message: 'Admin not found' });
      return res.json({
        success: true,
        user: { id: admin._id.toString(), name: admin.name, email: admin.email, role: 'admin' },
      });
    }

    const studentId = decoded.studentId || decoded.id;
    const student = await Admission.findById(studentId).select('-password').lean() as any;
    if (!student) return res.status(401).json({ success: false, message: 'Student not found' });

    return res.json({
      success: true,
      user: {
        id: student._id.toString(),
        name: student.studentName,
        email: student.email,
        phone: student.phoneNumber,
        standard: student.standard,
        registrationId: student.registrationId || '',
        avatar: student.photo || '',
        role: 'student',
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function logout(req: Request, res: Response) {
  return res.json({ success: true, message: 'Logged out successfully' });
}
