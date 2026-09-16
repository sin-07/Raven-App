import { Request, Response } from 'express';
import Admission from '../models/Admission';

export async function submitAdmission(req: Request, res: Response) {
  try {
    const data = req.body;

    if (!data.studentName || !data.phoneNumber || !data.email || !data.standard) {
      return res.status(400).json({
        success: false,
        message: 'Student name, phone number, email, and standard are required.',
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regId = `RAV-2026-${randomSuffix}`;

    const newAdmission = new Admission({
      ...data,
      registrationId: regId,
      submittedAt: new Date(),
      isActive: true,
      paymentStatus: data.paymentStatus || 'completed',
    });

    await newAdmission.save();

    return res.status(201).json({
      success: true,
      registrationId: regId,
      message: 'Admission submitted successfully! Please retain your registration ID.',
      admission: newAdmission,
    });
  } catch (error: any) {
    console.error('Error submitting admission:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit admission.',
    });
  }
}
