import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Badge, Button } from '../components';
import { Test, TestResult } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface TestRunnerScreenProps {
  route: any;
  navigation: any;
}

export const TestRunnerScreen: React.FC<TestRunnerScreenProps> = ({ route, navigation }) => {
  const { id } = route.params || {};
  const toast = useToast();
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      apiService.getTestById(id).then((t) => {
        if (t) {
          setTest(t);
          setSecondsRemaining(t.durationMinutes * 60);
        }
      });
    }
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!test || isSubmitted || secondsRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [test, isSubmitted, secondsRemaining]);

  const handleAutoSubmit = () => {
    toast.warning('Time up! Auto-submitting answers now.');
    calculateAndSubmitResults();
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
    toast.info(`Option ${String.fromCharCode(65 + optionIndex)} selected for Q${currentQuestionIndex + 1}`);
  };

  const calculateAndSubmitResults = async () => {
    if (!test) return;

    let marksObtained = 0;
    let correctCount = 0;

    test.questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (selected !== undefined && selected === q.correctAnswer) {
        marksObtained += q.marks;
        correctCount += 1;
      }
    });

    const percentage = Math.round((marksObtained / test.totalMarks) * 100);
    const passed = marksObtained >= test.passingMarks;
    const timeSpent = test.durationMinutes * 60 - secondsRemaining;

    const testResult: TestResult = {
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      totalMarks: test.totalMarks,
      marksObtained,
      percentage,
      passed,
      timeSpentSeconds: timeSpent,
      totalQuestions: test.questions.length,
      correctAnswersCount: correctCount,
      answers: selectedAnswers,
    };

    await apiService.submitTestResult(testResult);
    setResult(testResult);
    setIsSubmitted(true);
    toast.success(`Simulation completed! Score: ${marksObtained} / ${test.totalMarks} (${percentage}%)`);
  };

  const handleConfirmSubmit = () => {
    if (!test) return;
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = test.questions.length - answeredCount;

    Alert.alert(
      'Submit Test?',
      `You have answered ${answeredCount} of ${test.questions.length} questions.${
        unansweredCount > 0 ? `\n\nWarning: ${unansweredCount} questions remain unanswered.` : ''
      }`,
      [
        { text: 'Keep Answering', style: 'cancel' },
        { text: 'Submit Now', onPress: calculateAndSubmitResults },
      ]
    );
  };

  const handleExit = () => {
    if (isSubmitted) {
      toast.info('Returned to test list');
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Exit Test?',
      'Are you sure you want to leave? Your answers will not be saved.',
      [
        { text: 'Resume Test', style: 'cancel' },
        {
          text: 'Leave Test',
          style: 'destructive',
          onPress: () => {
            toast.warning('Test exited without saving.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!test) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Preparing test questions...</Text>
      </View>
    );
  }

  // ================= RESULTS SCREEN =================
  if (isSubmitted && result) {
    return (
      <View style={styles.container}>
        {/* Results Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Performance Analysis</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          {/* Result Score Banner */}
          <LinearGradient
            colors={result.passed ? ['#0B2B1B', '#13192B'] : ['#2B131B', '#13192B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.resultBanner, { borderColor: result.passed ? COLORS.primary : COLORS.rose }]}
          >
            <View
              style={[
                styles.resultIconCircle,
                { backgroundColor: result.passed ? COLORS.primaryMuted : COLORS.roseMuted },
              ]}
            >
              <Ionicons
                name={result.passed ? 'trophy' : 'alert-circle'}
                size={36}
                color={result.passed ? COLORS.primaryLight : COLORS.rose}
              />
            </View>

            <Badge
              label={result.passed ? 'QUALIFIED / PASS' : 'NEEDS REVISION'}
              variant={result.passed ? 'primary' : 'rose'}
              size="md"
            />

            <Text style={styles.scoreText}>
              {result.marksObtained} <Text style={styles.scoreMax}>/ {result.totalMarks}</Text>
            </Text>

            <Text style={styles.percentageText}>{result.percentage}% Score</Text>
            <Text style={styles.testSubjectTitle}>{test.title}</Text>
          </LinearGradient>

          {/* Quick Metrics Breakdown */}
          <View style={styles.resultsGrid}>
            <View style={styles.resultMetricBox}>
              <Text style={styles.metricBig}>{result.correctAnswersCount}</Text>
              <Text style={styles.metricSmall}>Correct</Text>
            </View>

            <View style={styles.resultMetricBox}>
              <Text style={[styles.metricBig, { color: COLORS.rose }]}>
                {result.totalQuestions - result.correctAnswersCount}
              </Text>
              <Text style={styles.metricSmall}>Incorrect</Text>
            </View>

            <View style={styles.resultMetricBox}>
              <Text style={[styles.metricBig, { color: COLORS.cyan }]}>
                {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
              </Text>
              <Text style={styles.metricSmall}>Time Taken</Text>
            </View>
          </View>

          {/* Detailed Question Review */}
          <Text style={styles.reviewHeader}>Question-by-Question Solution Review</Text>

          {test.questions.map((q, idx) => {
            const userChoice = result.answers[q.id];
            const isCorrect = userChoice === q.correctAnswer;
            const isAnswered = userChoice !== undefined;

            return (
              <View
                key={q.id}
                style={[
                  styles.reviewCard,
                  isCorrect ? styles.reviewCardCorrect : styles.reviewCardWrong,
                ]}
              >
                <View style={styles.reviewCardHeader}>
                  <Text style={styles.questionIndexLabel}>Question {(idx + 1).toString().padStart(2, '0')}</Text>
                  <View style={styles.statusIndicator}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={isCorrect ? COLORS.primaryLight : COLORS.rose}
                    />
                    <Text
                      style={[
                        styles.statusIndicatorText,
                        { color: isCorrect ? COLORS.primaryLight : COLORS.rose },
                      ]}
                    >
                      {isCorrect ? 'Correct (+4)' : isAnswered ? 'Incorrect (0)' : 'Unattempted (0)'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reviewQuestionText}>{q.questionText}</Text>

                {/* Option Breakdown */}
                <View style={styles.reviewOptionsList}>
                  {q.options.map((opt, optIdx) => {
                    const isUserPick = userChoice === optIdx;
                    const isRightAnswer = q.correctAnswer === optIdx;

                    return (
                      <View
                        key={optIdx}
                        style={[
                          styles.reviewOptionItem,
                          isRightAnswer && styles.reviewOptionRight,
                          isUserPick && !isRightAnswer && styles.reviewOptionWrongPick,
                        ]}
                      >
                        <View style={styles.optionLetterBox}>
                          <Text style={styles.optionLetterText}>
                            {String.fromCharCode(65 + optIdx)}
                          </Text>
                        </View>
                        <Text style={styles.reviewOptionText}>{opt}</Text>
                        {isRightAnswer && (
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.primaryLight} />
                        )}
                        {isUserPick && !isRightAnswer && (
                          <Ionicons name="close-circle" size={16} color={COLORS.rose} />
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Solution Explanation */}
                {q.explanation && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationLabel}>Faculty Solution Explanation:</Text>
                    <Text style={styles.explanationText}>{q.explanation}</Text>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.resultActions}>
            <Button
              title="Retake This Test"
              variant="outline"
              onPress={() => {
                setSelectedAnswers({});
                setIsSubmitted(false);
                setResult(null);
                setCurrentQuestionIndex(0);
                setSecondsRemaining(test.durationMinutes * 60);
                toast.info('Test reset. Timer restarted.');
              }}
              style={{ marginBottom: SPACING.md }}
            />
            <Button
              title="Back to Test Series"
              variant="primary"
              onPress={() => {
                toast.info('Returned to Test Series');
                navigation.goBack();
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ================= ACTIVE TEST ENGINE =================
  const currentQuestion = test.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const isTimeLow = secondsRemaining < 120; // less than 2 minutes

  return (
    <View style={styles.container}>
      {/* Test Runner Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleExit} style={styles.backButton}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Ionicons
            name="time-outline"
            size={18}
            color={isTimeLow ? COLORS.rose : COLORS.amber}
          />
          <Text style={[styles.timerText, isTimeLow && styles.timerTextLow]}>
            {formatTimer(secondsRemaining)}
          </Text>
        </View>

        <TouchableOpacity onPress={handleConfirmSubmit} style={styles.finishSmallButton}>
          <Text style={styles.finishSmallButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.testContent} showsVerticalScrollIndicator={false}>
        {/* Question Header */}
        <View style={styles.questionHeader}>
          <Text style={styles.questionCounter}>
            Question <Text style={styles.counterBold}>{currentQuestionIndex + 1}</Text> of{' '}
            {test.questions.length}
          </Text>
          <View style={styles.marksBadge}>
            <Text style={styles.marksBadgeText}>+{currentQuestion.marks} Marks</Text>
          </View>
        </View>

        {/* Question Text */}
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === optIdx;

            return (
              <TouchableOpacity
                key={optIdx}
                activeOpacity={0.8}
                onPress={() => handleSelectOption(currentQuestion.id, optIdx)}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              >
                <View
                  style={[styles.optionIndexCircle, isSelected && styles.optionIndexCircleSelected]}
                >
                  <Text
                    style={[styles.optionIndexText, isSelected && styles.optionIndexTextSelected]}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Question Nav Grid */}
        <View style={styles.navGridSection}>
          <Text style={styles.navGridTitle}>Jump to Question:</Text>
          <View style={styles.navGrid}>
            {test.questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = currentQuestionIndex === idx;

              return (
                <TouchableOpacity
                  key={q.id}
                  onPress={() => {
                    setCurrentQuestionIndex(idx);
                    toast.info(`Jumped to Question ${idx + 1}`);
                  }}
                  style={[
                    styles.navGridItem,
                    isAnswered && styles.navGridItemAnswered,
                    isCurrent && styles.navGridItemCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.navGridText,
                      isAnswered && styles.navGridTextAnswered,
                      isCurrent && styles.navGridTextCurrent,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footerBar}>
        <Button
          title="Previous"
          variant="secondary"
          size="md"
          onPress={() => {
            const nextIdx = Math.max(0, currentQuestionIndex - 1);
            setCurrentQuestionIndex(nextIdx);
            toast.info(`Question ${nextIdx + 1}`);
          }}
          disabled={currentQuestionIndex === 0}
          style={{ flex: 1, marginRight: SPACING.md }}
        />

        {isLastQuestion ? (
          <Button
            title="Submit Test"
            variant="primary"
            size="md"
            onPress={handleConfirmSubmit}
            style={{ flex: 1 }}
          />
        ) : (
          <Button
            title="Next Question"
            variant="primary"
            size="md"
            onPress={() => {
              const nextIdx = Math.min(test.questions.length - 1, currentQuestionIndex + 1);
              setCurrentQuestionIndex(nextIdx);
              toast.info(`Question ${nextIdx + 1}`);
            }}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.amber,
  },
  timerTextLow: {
    color: COLORS.rose,
  },
  finishSmallButton: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  finishSmallButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.surface,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  testContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  questionCounter: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  counterBold: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 16,
  },
  marksBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  marksBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  questionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  questionText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 23,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: SPACING.sm + 2,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionCardSelected: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  optionIndexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionIndexCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionIndexText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  optionIndexTextSelected: {
    color: '#0A0E1A',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginRight: SPACING.sm,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  navGridSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navGridTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  navGridItem: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navGridItemAnswered: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  navGridItemCurrent: {
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  navGridText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  navGridTextAnswered: {
    color: COLORS.primaryLight,
  },
  navGridTextCurrent: {
    color: '#FFFFFF',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
  },

  // Results Styles
  resultScroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  resultBanner: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  resultIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  scoreMax: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  testSubjectTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  resultMetricBox: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricBig: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  metricSmall: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  reviewHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  reviewCardCorrect: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  reviewCardWrong: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.rose,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  questionIndexLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  reviewOptionsList: {
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
  },
  reviewOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewOptionRight: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  reviewOptionWrongPick: {
    backgroundColor: COLORS.roseMuted,
    borderColor: COLORS.rose,
  },
  optionLetterBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  optionLetterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewOptionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  explanationBox: {
    backgroundColor: '#121C26',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  explanationLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyan,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  explanationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  resultActions: {
    marginTop: SPACING.lg,
  },
});
