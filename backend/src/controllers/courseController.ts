import { Request, Response } from 'express';
import Course from '../models/Course';

export async function getCourses(req: Request, res: Response) {
  try {
    const { category, level, search } = req.query;

    const query: any = { isPublished: true };
    if (category && category !== 'All') {
      query.category = category;
    }
    if (level && level !== 'All') {
      query.level = level;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 }).lean();

    const transformedCourses = courses.map((course: any) => ({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      shortDescription: (course.description || '').substring(0, 100) + '...',
      thumbnail:
        course.thumbnail ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
      instructor: {
        id: course._id.toString(),
        name: course.instructor,
        qualification: course.instructorQualification || '',
        avatar:
          course.instructorAvatar ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
      category: course.category,
      level: course.level,
      duration: course.duration,
      totalLessons: course.syllabus?.length || 0,
      totalStudents: course.enrolledStudents || 0,
      rating: course.rating || 0,
      price: course.price,
      originalPrice: course.originalPrice || course.price,
      isFree: course.price === 0,
      isPopular: (course.enrolledStudents || 0) > 100,
      features: course.features || [],
      syllabus: course.syllabus || [],
      createdAt: course.createdAt,
    }));

    return res.json({
      success: true,
      courses: transformedCourses,
      count: transformedCourses.length,
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
}

export async function getCourseById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    return res.json({
      success: true,
      course: {
        id: (course as any)._id.toString(),
        ...course,
      },
    });
  } catch (error: any) {
    console.error('Error fetching course by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
}
