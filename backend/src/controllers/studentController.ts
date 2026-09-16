import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import LiveClass from '../models/LiveClass';
import StudyMaterial from '../models/StudyMaterial';
import Course from '../models/Course';

export async function getStudentLiveClasses(req: AuthRequest, res: Response) {
  try {
    const student = req.student;
    const cleanStandard = student?.standard ? student.standard.replace(/\D/g, '') : '';

    const query: any = {};
    if (student?.standard) {
      query.class = {
        $in: [
          student.standard,
          `${cleanStandard}th`,
          `${cleanStandard}th standard`,
          cleanStandard,
        ],
      };
    }

    const classes = await LiveClass.find(query).sort({ scheduledAt: 1 }).lean();

    return res.json({
      success: true,
      classes,
      data: classes,
    });
  } catch (error: any) {
    console.error('Error fetching live classes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch live classes' });
  }
}

export async function getStudentStudyMaterials(req: AuthRequest, res: Response) {
  try {
    const student = req.student;
    const cleanStandard = student?.standard ? student.standard.replace(/\D/g, '') : '';

    const query: any = {};
    if (student?.standard) {
      query.class = {
        $in: [
          student.standard,
          `${cleanStandard}th`,
          `${cleanStandard}th standard`,
          cleanStandard,
        ],
      };
    }

    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      materials,
      data: materials,
    });
  } catch (error: any) {
    console.error('Error fetching study materials:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch study materials' });
  }
}

export async function getStudentCourses(req: AuthRequest, res: Response) {
  try {
    const courses = await Course.find({ isPublished: true }).limit(5).lean();
    return res.json({
      success: true,
      courses,
    });
  } catch (error: any) {
    console.error('Error fetching enrolled courses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
}
