import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  studentId: mongoose.Types.ObjectId;
  category: 'general' | 'course_content' | 'teaching_method' | 'study_materials' | 'online_classes' | 'test_system' | 'complaint';
  subject: string;
  message: string;
  rating?: number;
  status: 'new' | 'reviewed' | 'resolved';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Admission',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'course_content', 'teaching_method', 'study_materials', 'online_classes', 'test_system', 'complaint'],
    default: 'general'
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'resolved'],
    default: 'new'
  },
  adminResponse: {
    type: String
  }
}, {
  timestamps: true
});

const Feedback: Model<IFeedback> = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);

export default Feedback;
