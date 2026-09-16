import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import mongoose from 'mongoose';

export async function submitFeedback(req: Request, res: Response) {
  try {
    const { studentId, category, subject, message, rating, name, email } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    // Use provided studentId or create a dummy ObjectId for public queries
    const validStudentId = studentId && mongoose.Types.ObjectId.isValid(studentId)
      ? studentId
      : new mongoose.Types.ObjectId();

    const newFeedback = new Feedback({
      studentId: validStudentId,
      category: category || 'general',
      subject,
      message: `${name ? `[From: ${name} (${email || 'No email'})] ` : ''}${message}`,
      rating: rating ? Number(rating) : undefined,
      status: 'new',
    });

    await newFeedback.save();

    return res.status(201).json({
      success: true,
      message: 'Your query / feedback has been sent to Raven faculty. We will respond within 24 hours.',
      feedback: newFeedback,
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit feedback' });
  }
}
