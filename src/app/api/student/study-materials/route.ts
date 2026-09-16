import { NextResponse } from 'next/server';
import StudyMaterial from '@/models/StudyMaterial';
import { authenticateStudent } from '@/lib/apiMiddleware';

export async function GET() {
  try {
    const { student, error } = await authenticateStudent();
    if (error || !student) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const cleanStandard = student.standard.replace(/\D/g, '');

    // Match variations like '9th', '9th standard', '9', etc.
    const materials = await StudyMaterial.find({
      class: {
        $in: [
          student.standard,
          `${cleanStandard}th`,
          `${cleanStandard}th standard`,
          cleanStandard,
        ],
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: materials,
    });
  } catch (error: any) {
    console.error('Study Materials Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching study materials' },
      { status: 500 }
    );
  }
}

