import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: string;
  instructorQualification?: string;
  instructorAvatar?: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  syllabus: string[];
  features: string[];
  isPublished: boolean;
  enrolledStudents: number;
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
    },
    instructorQualification: {
      type: String,
      default: '',
    },
    instructorAvatar: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: [true, 'Level is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    syllabus: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for search and filtered listing
CourseSchema.index({ title: 'text', description: 'text', category: 'text' });
CourseSchema.index({ isPublished: 1, createdAt: -1 });
CourseSchema.index({ category: 1, isPublished: 1 });

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;

