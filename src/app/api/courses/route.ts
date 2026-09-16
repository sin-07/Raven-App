import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Course from '@/models/Course';

export async function GET() {
  try {
    await connectDB();

    // Fetch published courses with lean query
    const courses = await Course.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

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

    return NextResponse.json(
      {
        success: true,
        courses: transformedCourses,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching courses from DB, returning fallback:', error);
    return NextResponse.json({
      success: true,
      courses: [],
    });
  }
}

