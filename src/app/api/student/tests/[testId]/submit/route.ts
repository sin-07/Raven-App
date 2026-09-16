import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Test from '@/models/Test';
import { verifyStudentToken } from '@/lib/auth';
import { sendTestResultEmail } from '@/lib/email';

interface AnswerSubmission {
  questionId: string;
  answer: string | null;
  questionText?: string;
}

interface Violation {
  violationType: string;
  timestamp: string;
  question: number;
}

// POST - Submit test answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const token = request.cookies.get('studentToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyStudentToken(token);
    
    if (!decoded.success || !decoded.student) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const student = decoded.student;
    
    const { testId } = await params;
    const body = await request.json();
    const { answers, violations = [], timeSpent = 0 } = body as {
      answers: AnswerSubmission[];
      violations?: Violation[];
      timeSpent?: number;
    };
    
    await connectDB();
    
    // Get test
    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json(
        { success: false, message: 'Test not found' },
        { status: 404 }
      );
    }
    
    // Verify student's standard
    if (test.standard !== student.standard) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to submit this test' },
        { status: 403 }
      );
    }
    
    // Check if already submitted
    const existingResult = test.results?.find(
      (r: any) => r.studentId && r.studentId.toString() === student._id.toString()
    );
    if (existingResult) {
      return NextResponse.json(
        { success: false, message: 'You have already submitted this test' },
        { status: 400 }
      );
    }
    
    // Calculate marks for MCQ and True/False questions
    let marksObtained = 0;
    const gradedAnswers = answers.map((ans) => {
      const question = test.questions.find(
        (q: any) => q._id.toString() === ans.questionId || q.questionText === ans.questionText
      );
      let marksAwarded = 0;
      
      if (!question) {
        return {
          questionId: ans.questionId,
          answer: ans.answer || '',
          marksAwarded: 0
        };
      }
      
      if (question.questionType === 'MCQ' || question.questionType === 'True/False') {
        if (ans.answer && ans.answer === question.correctAnswer) {
          marksAwarded = question.marks;
          marksObtained += marksAwarded;
        }
      }
      // For Short Answer and Long Answer, marks need manual grading
      
      return {
        questionId: ans.questionId || (question as any)._id,
        answer: ans.answer || '',
        marksAwarded
      };
    });
    
    // Add result to test with violations tracking
    const resultStatus = marksObtained >= test.passingMarks ? 'Pass' : 'Fail';
    
    if (!test.results) {
      test.results = [];
    }
    
    test.results.push({
      studentId: student._id as any,
      marksObtained,
      status: resultStatus,
      submittedAt: new Date(),
      answers: gradedAnswers,
      violations: (violations || []) as any,
      timeSpent: timeSpent || 0
    });
    
    await test.save();
    
    // Send test result email
    try {
      await sendTestResultEmail({
        to: student.email,
        studentName: student.studentName,
        testTitle: test.title,
        subject: test.subject,
        marksObtained,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        status: resultStatus,
        submittedAt: new Date(),
        violationsCount: violations.length
      });
      console.log('✅ Test result email sent successfully');
    } catch (emailError) {
      // Don't fail the submission if email fails
      console.error('⚠️ Failed to send test result email:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test submitted successfully! Results have been sent to your email.',
      data: {
        marksObtained,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        status: resultStatus,
        violationsCount: violations.length
      }
    });
  } catch (error: any) {
    console.error('Submit test error:', error);
    return NextResponse.json(
      { success: false, message: 'Error submitting test' },
      { status: 500 }
    );
  }
}
