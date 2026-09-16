'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Loader from '@/components/Loader';
import { StudentProtectedRoute } from '@/components';

interface Question {
  _id?: string;
  questionText: string;
  questionType: 'MCQ' | 'True/False' | 'Short Answer';
  options?: string[];
  correctAnswer: string;
  marks: number;
}

interface Test {
  _id: string;
  testId: string;
  title: string;
  description?: string;
  subject: string;
  standard: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  questions: Question[];
}

interface Violation {
  violationType: string;
  timestamp: string;
  question: number;
}

function TakeTestPage() {
  const { testId } = useParams();
  const router = useRouter();

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const testContainerRef = useRef<HTMLDivElement>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch test details
  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  // Timer
  useEffect(() => {
    if (!testStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeRemaining]);

  // Anti-cheating: Detect tab switching
  useEffect(() => {
    if (!testStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Tab switched or window minimized');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [testStarted]);

  // Anti-cheating: Detect right-click
  useEffect(() => {
    if (!testStarted) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation('Right-click detected');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [testStarted]);

  // Anti-cheating: Detect copy/paste
  useEffect(() => {
    if (!testStarted) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('Copy attempt detected');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('Paste attempt detected');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [testStarted]);

  // Anti-cheating: Detect keyboard shortcuts
  useEffect(() => {
    if (!testStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J (DevTools)
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U (View Source)
      ) {
        e.preventDefault();
        recordViolation('Developer tools access attempt');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [testStarted]);

  // Anti-cheating: Monitor fullscreen exit
  useEffect(() => {
    if (!testStarted) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && testStarted) {
        recordViolation('Exited fullscreen mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [testStarted]);

  const fetchTestDetails = async () => {
    try {
      const res = await fetch(`/api/student/tests/${testId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setTest(data.data);
        setTimeRemaining(data.data.duration * 60); // Convert minutes to seconds
      } else {
        toast.error(data.message);
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Error loading test');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const recordViolation = (type: string) => {
    const violation: Violation = {
      violationType: type,
      timestamp: new Date().toISOString(),
      question: currentQuestion + 1,
    };

    setViolations((prev) => [...prev, violation]);

    // Show warning
    setShowWarning(true);

    // Clear existing timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Auto-hide warning after 3 seconds
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(false);
    }, 3000);

    // Auto-submit if too many violations
    if (violations.length >= 4) {
      toast.error('Too many violations detected. Test will be auto-submitted.');
      setTimeout(() => handleAutoSubmit(), 2000);
    }
  };

  const enterFullscreen = async () => {
    try {
      // Try to enter fullscreen, but don't block if it fails
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {
          // Fullscreen failed, but continue anyway
          console.log('Fullscreen not available, continuing without it');
        });
      }
      setIsFullscreen(true);
      setTestStarted(true);
    } catch (error) {
      // If fullscreen fails, still allow test to start
      console.log('Fullscreen not supported, starting test anyway');
      setIsFullscreen(false);
      setTestStarted(true);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer,
    });
  };

  const handleNext = () => {
    if (test && currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleAutoSubmit = async () => {
    await handleSubmit(true);
  };

  const confirmSubmit = async () => {
    if (!test) return;
    
    setShowSubmitModal(false);
    setSubmitting(true);

    try {
      // Format answers for submission
      const formattedAnswers = test.questions.map((question, index) => ({
        questionId: question._id || index.toString(),
        answer: answers[index] || null,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        marks: question.marks,
      }));

      const submissionData = {
        testId: test._id,
        answers: formattedAnswers,
        violations,
        timeSpent: test.duration * 60 - timeRemaining,
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/student/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Test submitted successfully!');

        // Exit fullscreen
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }

        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Error submitting test');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Error submitting test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      setShowSubmitModal(true);
      return;
    }

    // For auto-submit, call confirmSubmit directly
    await confirmSubmit();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] relative overflow-hidden">
        {/* Green Radial Glow Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
        </div>

        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Test not found
          </h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#00E5A8] hover:bg-[#00E5A8]/90 text-black px-6 py-2 rounded-full hover:scale-105 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] relative overflow-hidden px-4 py-20 sm:py-24">
        {/* Green Radial Glow Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1000px] md:w-[1200px] h-[600px] sm:h-[700px] md:h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.15)_0%,_rgba(0,229,168,0.08)_30%,_transparent_70%)]"></div>
        </div>

        <div className="relative z-10 bg-[#111111] rounded-2xl shadow-2xl w-full max-w-[96%] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-800">
          {/* RAVEN Logo */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex items-center gap-3 bg-[#00E5A8] text-black rounded-xl px-6 py-3 sm:px-8 sm:py-4 font-bold text-xl sm:text-2xl shadow-lg">
              <img
                src="/logo.png"
                alt="RAVEN"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain brightness-0"
              />
              <span>RAVEN TUTORIALS</span>
            </div>
          </div>

          {/* Test Title & Subject */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
              {test.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#00E5A8] font-semibold">
              {test.subject} • {test.standard}
            </p>
            {test.description && (
              <p className="text-sm sm:text-base text-gray-400 mt-3 max-w-2xl mx-auto">{test.description}</p>
            )}
          </div>

          {/* Test Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
            <div className="bg-[#080808] p-4 sm:p-5 md:p-6 rounded-xl border border-gray-800 text-center hover:border-[#00E5A8]/30 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-[#00E5A8]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#00E5A8]" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-1">Duration</p>
              <p className="text-xl sm:text-2xl font-bold text-[#00E5A8]">
                {test.duration} <span className="text-sm font-normal">min</span>
              </p>
            </div>
            <div className="bg-[#080808] p-4 sm:p-5 md:p-6 rounded-xl border border-gray-800 text-center hover:border-green-500/30 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-1">Total Marks</p>
              <p className="text-xl sm:text-2xl font-bold text-green-500">
                {test.totalMarks}
              </p>
            </div>
            <div className="bg-[#080808] p-4 sm:p-5 md:p-6 rounded-xl border border-gray-800 text-center hover:border-blue-500/30 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-1">Questions</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-500">
                {test.questions.length}
              </p>
            </div>
            <div className="bg-[#080808] p-4 sm:p-5 md:p-6 rounded-xl border border-gray-800 text-center hover:border-orange-500/30 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-orange-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-1">Pass Marks</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-500">
                {test.passingMarks}
              </p>
            </div>
          </div>

          {/* Anti-Cheating Rules */}
          <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <AlertTriangle
                className="text-yellow-500 flex-shrink-0 mt-1 w-5 h-5 sm:w-6 sm:h-6"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-400 text-base sm:text-lg mb-2 sm:mb-3">
                  Anti-Cheating Rules:
                </h3>
                <ul className="text-xs sm:text-sm text-yellow-300/80 space-y-1.5 sm:space-y-2">
                  <li>• Fullscreen mode is recommended</li>
                  <li>• Do not switch tabs or minimize the window</li>
                  <li>• Right-click is disabled</li>
                  <li>• Copy/paste is disabled</li>
                  <li>• Developer tools are blocked</li>
                  <li>• All violations will be recorded and may result in auto-submission</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={enterFullscreen}
            className="w-full bg-[#00E5A8] hover:bg-[#00E5A8]/90 text-black py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg md:text-xl shadow-lg hover:shadow-[#00E5A8]/20 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3"
          >
            <span>Start Test</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4">
            Note: Fullscreen mode is recommended but not required to start the test
          </p>

          {/* Back to Dashboard */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-4 sm:mt-5 text-gray-400 hover:text-white text-sm sm:text-base py-2 sm:py-3 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== undefined;

  return (
    <div ref={testContainerRef} className="min-h-screen bg-[#0b0b0b] relative overflow-hidden pt-16">
      {/* Green Radial Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
      </div>

      {/* Warning Banner */}
      {showWarning && (
        <div className="fixed top-16 left-0 right-0 bg-red-600 text-white py-3 px-4 z-50 animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <AlertCircle className="mr-2" size={20} />
            <span className="font-semibold">
              Warning: Suspicious activity detected! ({violations.length}{' '}
              violations recorded)
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-[#111111] shadow-md border-b border-gray-800 ${showWarning ? 'mt-12' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#00E5A8] text-black rounded-lg px-4 py-2 font-bold text-xl">
                <img
                  src="/logo.png"
                  alt="RAVEN"
                  className="w-8 h-8 object-contain brightness-0"
                />
                RAVEN
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {test.title}
                </h1>
                <p className="text-sm text-gray-400">{test.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock
                  className={
                    timeRemaining < 300 ? 'text-red-500' : 'text-[#00E5A8]'
                  }
                  size={20}
                />
                <span
                  className={`text-lg font-mono font-bold ${
                    timeRemaining < 300 ? 'text-red-500' : 'text-white'
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Question</p>
                <p className="text-lg font-bold text-white">
                  {currentQuestion + 1} / {test.questions.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-[#111111] rounded-lg shadow-md p-4 sticky top-4 border border-gray-800">
              <h3 className="font-semibold text-white mb-3">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {test.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                      currentQuestion === index
                        ? 'bg-[#00E5A8] text-black ring-2 ring-[#00E5A8]/50'
                        : answers[index] !== undefined
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#00E5A8] rounded"></div>
                  <span className="text-gray-400">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500 rounded"></div>
                  <span className="text-gray-400">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 border border-gray-700 rounded"></div>
                  <span className="text-gray-400">Not Answered</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">Progress</p>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                  <div
                    className="bg-[#00E5A8] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (Object.keys(answers).length / test.questions.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Object.keys(answers).length} / {test.questions.length}{' '}
                  answered
                </p>
              </div>
            </div>
          </div>

          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-[#111111] rounded-lg shadow-md p-6 mb-6 border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Question {currentQuestion + 1}
                </h2>
                <span className="bg-[#00E5A8]/20 text-[#00E5A8] px-3 py-1 rounded-full text-sm font-semibold">
                  {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>

              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {question.questionText}
              </p>

              {question.questionType === 'MCQ' && (
                <div className="space-y-3">
                  {question.options?.map(
                    (option, index) =>
                      option && (
                        <label
                          key={index}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[currentQuestion] === option
                              ? 'border-[#00E5A8] bg-[#00E5A8]/10'
                              : 'border-gray-700 hover:border-[#00E5A8]/50 hover:bg-gray-800/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            value={option}
                            checked={answers[currentQuestion] === option}
                            onChange={(e) =>
                              handleAnswerChange(
                                currentQuestion,
                                e.target.value
                              )
                            }
                            className="w-5 h-5 accent-[#00E5A8]"
                          />
                          <span className="ml-3 text-gray-300">{option}</span>
                        </label>
                      )
                  )}
                </div>
              )}

              {question.questionType === 'True/False' && (
                <div className="space-y-3">
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        answers[currentQuestion] === option
                          ? 'border-[#00E5A8] bg-[#00E5A8]/10'
                          : 'border-gray-700 hover:border-[#00E5A8]/50 hover:bg-gray-800/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion, e.target.value)
                        }
                        className="w-5 h-5 accent-[#00E5A8]"
                      />
                      <span className="ml-3 text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.questionType === 'Short Answer' && (
                <textarea
                  value={answers[currentQuestion] || ''}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion, e.target.value)
                  }
                  className="w-full p-4 bg-[#080808] border-2 border-gray-800 rounded-lg focus:border-[#00E5A8] focus:outline-none text-white placeholder-gray-500"
                  rows={4}
                  placeholder="Type your answer here..."
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                ← Previous
              </button>

              <div className="flex gap-3">
                {currentQuestion === test.questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-[#00E5A8] hover:from-green-700 hover:to-[#00B386] text-white rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Test'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-[#00E5A8] hover:bg-[#00E5A8]/90 text-black rounded-full font-semibold hover:scale-105 transition-all"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4">
          <div className="bg-[#111111] rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn border border-gray-800">
            <div className="text-center">
              {/* RAVEN Logo */}
              <div className="mx-auto flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-2 bg-[#00E5A8] text-black rounded-lg px-4 py-2 font-bold text-2xl">
                  <img
                    src="/logo.png"
                    alt="RAVEN"
                    className="w-8 h-8 object-contain brightness-0"
                  />
                  RAVEN
                </div>
              </div>

              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/20 mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                Submit Test?
              </h3>

              <div className="mb-6 space-y-3">
                <div className="bg-[#00E5A8]/10 border border-[#00E5A8]/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">
                    Questions Answered
                  </p>
                  <p className="text-3xl font-bold text-[#00E5A8]">
                    {Object.keys(answers).length} / {test.questions.length}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Answered</p>
                    <p className="text-xl font-bold text-green-400">
                      {Object.keys(answers).length}
                    </p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Unanswered</p>
                    <p className="text-xl font-bold text-red-400">
                      {test.questions.length - Object.keys(answers).length}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-6">
                {Object.keys(answers).length < test.questions.length ? (
                  <span className="text-yellow-400 font-medium">
                    ⚠️ You have unanswered questions. Are you sure you want to
                    submit?
                  </span>
                ) : (
                  <span className="text-green-400 font-medium">
                    ✓ All questions answered. Ready to submit?
                  </span>
                )}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-[#00E5A8] hover:from-green-700 hover:to-[#00B386] text-white py-3 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Yes, Submit'}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Once submitted, you cannot modify your answers
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with StudentProtectedRoute for security
export default function ProtectedTestPage() {
  return (
    <StudentProtectedRoute>
      <TakeTestPage />
    </StudentProtectedRoute>
  );
}

