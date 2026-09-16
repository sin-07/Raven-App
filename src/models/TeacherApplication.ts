import mongoose, { Schema, Document } from 'mongoose';

/**
 * Teacher Application Model
 * -------------------------
 * This model stores teacher/instructor admission applications.
 * Applications go through a workflow: pending → approved/rejected
 */

export interface ITeacherApplication extends Document {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  subjects: string[];
  resume?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherApplicationSchema = new Schema<ITeacherApplication>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'],
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      minlength: [5, 'Qualification must be at least 5 characters'],
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
    },
    subjects: {
      type: [String],
      required: [true, 'At least one subject is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'Please select at least one subject',
      },
    },
    resume: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
TeacherApplicationSchema.index({ email: 1 }, { unique: true });
TeacherApplicationSchema.index({ phone: 1 }, { unique: true });
TeacherApplicationSchema.index({ status: 1 });
TeacherApplicationSchema.index({ createdAt: -1 });

export default mongoose.models.TeacherApplication || 
  mongoose.model<ITeacherApplication>('TeacherApplication', TeacherApplicationSchema);
