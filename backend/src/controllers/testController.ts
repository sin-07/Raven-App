import { Request, Response } from 'express';
import Test from '../models/Test';

export async function getTests(req: Request, res: Response) {
  try {
    const { standard } = req.query;
    const query: any = { status: { $in: ['PUBLISHED', 'DRAFT'] } };

    if (standard && standard !== 'All') {
      const clean = String(standard).replace(/\D/g, '');
      query.standard = { $in: [standard, `${clean}th`, clean] };
    }

    const tests = await Test.find(query).sort({ createdAt: -1 }).lean();

    const formattedTests = tests.map((t: any) => ({
      id: t._id.toString(),
      testId: t.testId,
      title: t.title,
      description: t.description || '',
      subject: t.subject,
      standard: t.standard,
      durationMinutes: t.duration,
      totalMarks: t.totalMarks,
      passingMarks: t.passingMarks,
      questionsCount: t.questions?.length || 0,
      difficulty: 'Medium',
      questions: (t.questions || []).map((q: any, idx: number) => ({
        id: q._id ? q._id.toString() : `q-${idx}`,
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : 0,
        marks: q.marks || 1,
      })),
    }));

    return res.json({
      success: true,
      tests: formattedTests,
      data: formattedTests,
    });
  } catch (error: any) {
    console.error('Error fetching tests:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tests', error: error.message });
  }
}

export async function getTestById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const t = await Test.findById(id).lean() as any;

    if (!t) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const formattedTest = {
      id: t._id.toString(),
      testId: t.testId,
      title: t.title,
      description: t.description || '',
      subject: t.subject,
      standard: t.standard,
      durationMinutes: t.duration,
      totalMarks: t.totalMarks,
      passingMarks: t.passingMarks,
      questionsCount: t.questions?.length || 0,
      difficulty: 'Medium',
      questions: (t.questions || []).map((q: any, idx: number) => ({
        id: q._id ? q._id.toString() : `q-${idx}`,
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : 0,
        marks: q.marks || 1,
      })),
    };

    return res.json({
      success: true,
      test: formattedTest,
    });
  } catch (error: any) {
    console.error('Error fetching test by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch test', error: error.message });
  }
}

export async function submitTestResult(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { result, studentId } = req.body;

    return res.json({
      success: true,
      message: 'Test submitted successfully!',
      result,
    });
  } catch (error: any) {
    console.error('Error submitting test result:', error);
    return res.status(500).json({ success: false, message: 'Failed to record test result' });
  }
}
