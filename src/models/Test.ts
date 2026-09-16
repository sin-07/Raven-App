import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================
// INTERFACES
// ============================================

export interface IQuestion {
  questionText: string;
  questionType: 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False';
  options?: string[];
  correctAnswer?: string;
  marks: number;
}

export interface ITestResult {
  studentId: mongoose.Types.ObjectId;
  marksObtained: number;
  status: 'Pass' | 'Fail' | 'Absent';
  submittedAt?: Date;
  answers?: Array<{
    questionId: string;
    answer: string;
    marksAwarded: number;
  }>;
  violations?: Array<{
    violationType: string;
    timestamp: Date;
    question: number;
  }>;
  timeSpent?: number;
}

// Test Status Flow: DRAFT -> PUBLISHED -> EXPIRED
// DRAFT: Created but not visible to students
// PUBLISHED: Visible to students (between startDate and endDate)
// EXPIRED: Past endDate, no longer visible to students
export type TestStatus = 'DRAFT' | 'PUBLISHED' | 'EXPIRED';

export interface ITest extends Document {
  testId: string;
  title: string;
  description?: string;
  standard: '6th' | '7th' | '8th' | '9th' | '10th' | '11th' | '12th';
  subject: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  questions: IQuestion[];
  results?: ITestResult[];
  status: TestStatus;
  publishedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SCHEMA
// ============================================

const testSchema = new Schema<ITest>({
  testId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  standard: {
    type: String,
    enum: ['6th', '7th', '8th', '9th', '10th', '11th', '12th'],
    required: [true, 'Standard/Class is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be at least 1']
  },
  passingMarks: {
    type: Number,
    required: [true, 'Passing marks is required'],
    min: [0, 'Passing marks cannot be negative']
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'Short Answer', 'Long Answer', 'True/False'],
      required: true
    },
    options: [{
      type: String
    }],
    correctAnswer: {
      type: String
    },
    marks: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  results: [{
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Admission'
    },
    marksObtained: Number,
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Absent'],
      default: 'Absent'
    },
    submittedAt: Date,
    answers: [{
      questionId: String,
      answer: String,
      marksAwarded: Number
    }],
    violations: [{
      violationType: String,
      timestamp: Date,
      question: Number
    }],
    timeSpent: {
      type: Number,
      default: 0
    }
  }],
  // Status: DRAFT (default) -> PUBLISHED (by admin) -> EXPIRED (auto after endDate)
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'EXPIRED'],
    default: 'DRAFT'
  },
  publishedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  publishedAt: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// ============================================
// INDEXES
// ============================================

// Index for efficient student queries (status + standard + date range)
testSchema.index({ status: 1, standard: 1, startDate: 1, endDate: 1 });

// Index for testId lookups
testSchema.index({ testId: 1 });

// ============================================
// MODEL EXPORT
// ============================================

const Test: Model<ITest> = mongoose.models.Test || mongoose.model<ITest>('Test', testSchema);

export default Test;

