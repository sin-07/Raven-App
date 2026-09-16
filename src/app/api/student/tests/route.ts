import { NextResponse } from 'next/server';
import Test from '@/models/Test';
import { authenticateStudent } from '@/lib/apiMiddleware';

async function autoExpireTests(): Promise<void> {
  const now = new Date();
  await Test.updateMany(
    {
      status: 'PUBLISHED',
      endDate: { $lt: now },
    },
    {
      $set: { status: 'EXPIRED' },
    }
  );
}

export async function GET() {
  try {
    const { student, error } = await authenticateStudent();
    if (error || !student) {
      return error || NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await autoExpireTests();

    const now = new Date();
    const cleanStandard = student.standard.replace(/\D/g, '');

    const visibleTests = await Test.find({
      status: 'PUBLISHED',
      standard: {
        $in: [
          student.standard,
          `${cleanStandard}th`,
          `${cleanStandard}th standard`,
          cleanStandard,
        ],
      },
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select('testId title description subject standard startDate endDate duration totalMarks passingMarks results')
      .sort({ startDate: 1 })
      .lean();

    const testsWithAttemptStatus = visibleTests.map((test: any) => {
      const hasAttempted = test.results?.some(
        (result: any) => result.studentId?.toString() === student._id.toString()
      );
      return {
        ...test,
        hasAttempted: !!hasAttempted,
        timeRemaining: Math.max(0, new Date(test.endDate).getTime() - now.getTime()),
      };
    });

    return NextResponse.json({
      success: true,
      data: testsWithAttemptStatus,
      count: testsWithAttemptStatus.length,
      studentStandard: student.standard,
    });
  } catch (error: any) {
    console.error('Student Tests Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching tests' },
      { status: 500 }
    );
  }
}

