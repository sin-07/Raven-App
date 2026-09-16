import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import Admission from '../models/Admission';

const JWT_SECRET = process.env.JWT_SECRET || 'raven-tutorials-secret-key-production-change';

export interface AuthRequest extends Request {
  student?: any;
  admin?: any;
}

export function generateToken(payload: object, expiresIn: string | number = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export async function authenticateStudent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Missing or invalid Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const studentId = decoded.studentId || decoded.id;
    const student = await Admission.findById(studentId).select('-password').lean();

    if (!student || !student.isActive) {
      return res.status(401).json({ success: false, message: 'Student account not found or inactive.' });
    }

    req.student = student;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export async function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Admin authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const admin = await Admin.findById(decoded.id).select('-password').lean();

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account not found or inactive.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token.' });
  }
}
